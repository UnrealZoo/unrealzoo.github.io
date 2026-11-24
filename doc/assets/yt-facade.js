/* YouTube 点击即播 facade：避免页面加载时就拉起 YouTube 播放器 */
(function () {
  function buildIframe(ytid) {
    var f = document.createElement('iframe');
    f.width = '640';
    f.height = '360';
    f.src = 'https://www.youtube-nocookie.com/embed/' + ytid + '?autoplay=1&rel=0';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    f.style.width = '100%';
    f.style.maxWidth = '640px';
    f.style.aspectRatio = '16 / 9';
    f.style.border = '0';
    f.style.borderRadius = '8px';
    f.style.display = 'block';
    return f;
  }

  document.addEventListener('click', function (e) {
    var box = e.target.closest ? e.target.closest('.yt-facade') : null;
    if (!box) return;
    var ytid = box.getAttribute('data-yt');
    if (!ytid) return;
    e.preventDefault();
    var f = buildIframe(ytid);
    box.innerHTML = '';
    box.appendChild(f);
    box.style.cursor = 'default';
  });
})();
