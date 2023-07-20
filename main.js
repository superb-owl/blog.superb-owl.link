if (window.location.href.indexOf('/p/') === -1) {
  loadHome();
} else {
  loadPost();
}

async function fillDetails(post) {
  const resp = await fetch(post.story_permalink.replace('https://superbowl.substack.com', 'https://proxy.superb-owl.link'));
  const html = await resp.text();
  const el = $( '<div></div>' );
  el.html(html);

  const imageMeta = $('meta[property="og:image"]', el);
  post.image = imageMeta.attr('content')
    .replace('f_jpg', 'f_auto')
    .replace(/h_\d+,/, '')
    .replace(/w_\d+,/, 'w_600,');

  const descMeta = $('h3.subtitle', el);
  post.description = descMeta.text();
}

