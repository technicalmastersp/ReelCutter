/* Reel Cutter keyframe inspector.
   Reads only the 'moov' index of a standard MP4/MOV; never decodes video, never uploads. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var fileInput = $('kiFile'), msg = $('kiMsg'), out = $('kiOut');
  var current = null; // last parsed result, so min/max edits recompute without re-reading the file

  function u32(b, o) { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }
  function u16(b, o) { return (b[o] << 8) | b[o + 1]; }
  function u64(b, o) { return u32(b, o) * 4294967296 + u32(b, o + 4); }
  function t4(b, o) { return String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]); }
  async function read(file, s, e) { return new Uint8Array(await file.slice(s, e).arrayBuffer()); }

  function boxes(b, s, e) {
    var list = [], o = s;
    while (o + 8 <= e) {
      var sz = u32(b, o), type = t4(b, o + 4), hdr = 8;
      if (sz === 1) { if (o + 16 > e) break; sz = u64(b, o + 8); hdr = 16; }
      else if (sz === 0) { sz = e - o; }
      if (sz < hdr || o + sz > e) break;
      list.push({ type: type, start: o, body: o + hdr, end: o + sz });
      o += sz;
    }
    return list;
  }
  function find(list, type) { return list.filter(function (x) { return x.type === type; })[0]; }

  async function scanTop(file) {
    var o = 0, found = { moov: null, moof: false, brand: '' };
    while (o + 8 <= file.size) {
      var h = await read(file, o, Math.min(o + 16, file.size));
      var sz = u32(h, 0), type = t4(h, 4), hdr = 8;
      if (sz === 1) { if (h.length < 16) break; sz = u64(h, 8); hdr = 16; }
      else if (sz === 0) { sz = file.size - o; }
      if (sz < hdr) break;
      if (type === 'ftyp') { var f = await read(file, o + hdr, o + hdr + 4); found.brand = t4(f, 0); }
      if (type === 'moov') found.moov = { start: o, body: o + hdr, end: o + sz };
      if (type === 'moof') found.moof = true;
      o += sz;
    }
    return found;
  }

  function parseTrak(b, trak) {
    var inner = boxes(b, trak.body, trak.end);
    var mdia = find(inner, 'mdia'); if (!mdia) return null;
    var m = boxes(b, mdia.body, mdia.end);
    var mdhd = find(m, 'mdhd'), hdlr = find(m, 'hdlr'), minf = find(m, 'minf');
    if (!mdhd || !hdlr || !minf) return null;
    var ver = b[mdhd.body];
    var timescale = ver === 1 ? u32(b, mdhd.body + 20) : u32(b, mdhd.body + 12);
    var stbl = find(boxes(b, minf.body, minf.end), 'stbl'); if (!stbl) return null;
    var s = boxes(b, stbl.body, stbl.end);
    var stsd = find(s, 'stsd'), stts = find(s, 'stts'), stss = find(s, 'stss');
    if (!stsd || !stts) return null;
    var tr = { type: t4(b, hdlr.body + 8), timescale: timescale, format: t4(b, stsd.body + 12), width: 0, height: 0 };
    if (tr.type === 'vide') { tr.width = u16(b, stsd.body + 8 + 32); tr.height = u16(b, stsd.body + 8 + 34); }
    var n = u32(b, stts.body + 4), runs = [];
    for (var i = 0; i < n; i++) runs.push([u32(b, stts.body + 8 + i * 8), u32(b, stts.body + 12 + i * 8)]);
    var keys = null;
    if (stss) { var k = u32(b, stss.body + 4); keys = new Array(k); for (var j = 0; j < k; j++) keys[j] = u32(b, stss.body + 8 + j * 4); }
    // One pass over time-to-sample runs gives the time of every keyframe and the track length.
    var sampleNo = 1, time = 0, ki = 0, keyTimes = [];
    runs.forEach(function (r) {
      if (keys) { while (ki < keys.length && keys[ki] < sampleNo + r[0]) { keyTimes.push((time + (keys[ki] - sampleNo) * r[1]) / timescale); ki++; } }
      time += r[0] * r[1]; sampleNo += r[0];
    });
    tr.samples = sampleNo - 1; tr.duration = time / timescale; tr.allSync = !keys;
    tr.keyTimes = keys ? keyTimes : null;
    return tr;
  }

  async function inspect(file) {
    var top = await scanTop(file);
    if (!top.moov) throw new Error('No movie index (moov) found. This does not look like a standard MP4/MOV file.');
    if (top.moof) throw new Error('This is a fragmented MP4 (index split across many pieces). The inspector reads standard files only, but the splitter can handle fragmented files.');
    if (top.moov.end - top.moov.start > 512 * 1024 * 1024) throw new Error('The file index is unusually large; refusing to load it into memory.');
    var b = await read(file, top.moov.body, top.moov.end);
    var traks = boxes(b, 0, b.length).filter(function (x) { return x.type === 'trak'; });
    var tracks = traks.map(function (t) { return parseTrak(b, t); }).filter(Boolean);
    var v = tracks.filter(function (t) { return t.type === 'vide'; })[0];
    var a = tracks.filter(function (t) { return t.type === 'soun'; })[0];
    if (!v) throw new Error('No video track found in this file.');
    return { brand: top.brand, v: v, a: a, size: file.size };
  }

  // Same planning rule as the splitter in index.html.
  function plan(total, minLen, maxLen) {
    var target = (minLen + maxLen) / 2, parts = Math.max(1, Math.ceil(total / target)), len = total / parts;
    if (len < minLen && total > minLen) { len = maxLen; parts = Math.ceil(total / len); }
    var cuts = [];
    for (var i = 0; i < parts; i++) cuts.push(i * len);
    return cuts;
  }
  function atOrBefore(keys, t) { var r = 0; for (var i = 0; i < keys.length; i++) { if (keys[i] <= t + 1e-9) r = keys[i]; else break; } return r; }
  function fmt(s) { var m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(2); }
  function cell(tag, text) { var e = document.createElement(tag); e.textContent = text; return e; }
  function stat(label, value) { var d = document.createElement('div'); d.className = 'ki-stat'; var b = document.createElement('b'); b.textContent = value; var s = document.createElement('span'); s.textContent = label; d.appendChild(b); d.appendChild(s); return d; }

  function render() {
    if (!current) return;
    var v = current.v, a = current.a, keys = v.keyTimes || [], total = v.duration;
    var minLen = parseFloat($('kiMin').value) || 150, maxLen = parseFloat($('kiMax').value) || 160;
    if (maxLen < minLen) maxLen = minLen;
    var gaps = [];
    for (var i = 1; i < keys.length; i++) gaps.push(keys[i] - keys[i - 1]);
    if (keys.length) gaps.push(Math.max(0, total - keys[keys.length - 1]));
    var maxGap = gaps.length ? Math.max.apply(null, gaps) : 0;
    var avgGap = gaps.length ? gaps.reduce(function (x, y) { return x + y; }, 0) / gaps.length : 0;

    var st = $('kiStats'); st.textContent = '';
    st.appendChild(stat('Duration', fmt(total)));
    st.appendChild(stat('Resolution', v.width + '×' + v.height));
    st.appendChild(stat('Frame rate', (v.samples / total).toFixed(2) + ' fps'));
    st.appendChild(stat('Video codec', v.format));
    st.appendChild(stat('Audio codec', a ? a.format : 'none'));
    st.appendChild(stat('Keyframes', v.allSync ? 'every frame' : String(keys.length)));
    if (!v.allSync) { st.appendChild(stat('Avg interval', avgGap.toFixed(2) + ' s')); st.appendChild(stat('Longest interval', maxGap.toFixed(2) + ' s')); }
    st.appendChild(stat('File size', (current.size / 1048576).toFixed(1) + ' MB'));

    var cuts = plan(total, minLen, maxLen);
    var tb = $('kiCuts'); tb.textContent = '';
    var strip = $('kiStrip'); strip.textContent = '';
    var worst = 0;
    if (v.keyTimes) keys.forEach(function (k) { var t = document.createElement('i'); t.style.left = (k / total * 100) + '%'; strip.appendChild(t); });
    cuts.forEach(function (c, idx) {
      var actual = (idx === 0 || v.allSync) ? c : atOrBefore(keys, c);
      if (idx === 0) actual = 0;
      var drift = c - actual; worst = Math.max(worst, drift);
      var tr = document.createElement('tr');
      tr.appendChild(cell('td', String(idx + 1))); tr.appendChild(cell('td', fmt(c)));
      tr.appendChild(cell('td', fmt(actual))); tr.appendChild(cell('td', drift.toFixed(2) + ' s'));
      tb.appendChild(tr);
      var m = document.createElement('b'); m.style.left = (actual / total * 100) + '%'; strip.appendChild(m);
    });
    var verdict = $('kiVerdict');
    verdict.className = 'ki-note' + (worst > 5 ? ' warn' : '');
    verdict.textContent = cuts.length + ' part(s) planned. The largest shift from the planned time is ' + worst.toFixed(2) + ' s' +
      (worst > 5 ? ', so some parts will be noticeably longer or shorter than you asked for. This file has long gaps between keyframes; re-exporting it with a shorter keyframe interval before splitting would give tighter cuts.'
                 : ', so parts should land close to the lengths you asked for.');
    out.hidden = false;
  }

  async function onFile(file) {
    $('kiName').textContent = file.name + '  (' + (file.size / 1048576).toFixed(1) + ' MB)';
    msg.hidden = true; out.hidden = true; current = null;
    try { current = await inspect(file); render(); }
    catch (e) { msg.className = 'ki-note warn'; msg.textContent = e.message || String(e); msg.hidden = false; }
  }

  fileInput.addEventListener('change', function (e) { if (e.target.files.length) onFile(e.target.files[0]); });
  var drop = document.querySelector('.ki-drop');
  ['dragover', 'drop'].forEach(function (n) { drop.addEventListener(n, function (e) { e.preventDefault(); if (n === 'drop' && e.dataTransfer.files.length) onFile(e.dataTransfer.files[0]); }); });
  $('kiMin').addEventListener('input', render); $('kiMax').addEventListener('input', render);
})();
