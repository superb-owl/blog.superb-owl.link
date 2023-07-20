async function loadPost() {
  $('body').addClass('post-view');
  const postURL = window.location.href
    .replace(/^.*\/p\/([\w-]+).*$/, '/p/$1');
  console.log('load post', postURL);
  let page = 1;
  while (true) {
    let resp = await fetch('https://newsblur.com/reader/feed/8737923?page=' + page);
    resp = await resp.json();
    if (resp.stories.length === 0) break;
    page++;
    for (let i = 0; i < resp.stories.length; ++i) {
      const story = resp.stories[i];
      if (story.story_permalink.indexOf(postURL) === -1) continue;
      try {
        console.log('found story', story.story_permalink);
        await fillDetails(story);
      } catch (e) {
        console.log('error filling details for', story.story_permalink);
        continue;
      }
      $("#post").append(`
        <hr>
        <h1 class="title">${story.story_title}</h1>
        <h3 class="subtitle">${story.description}</h3>
        <a class="substack-link" href="${story.story_permalink}">View on Substack</a>
        <hr>
        ${fixContent(story.story_content)}
      `);
      $('a[href="https://superbowl.substack.com/subscribe"]').replaceWith(`
      <iframe src="https://superbowl.substack.com/embed" width="480" height="75" frameborder="0" scrolling="no"></iframe>
      `);
      $("h1").each(function() {
        $(this).attr('id', $(this).text().replaceAll(/\W+/g, '-').toLowerCase())
      });
      $("h2").each(function() {
        $(this).attr('id', $(this).text().replaceAll(/\W+/g, '-').toLowerCase())
      });
      $("h3").each(function() {
        $(this).attr('id', $(this).text().replaceAll(/\W+/g, '-').toLowerCase())
      });
      $('a[href^="https://superbowl.substack.com/i/"').each(function() {
        console.log('h1', $(this).text());
        let href = $(this).attr('href');
        href = href.replace(/https:\/\/superbowl\.substack\.com\/i\/\w+\/([\w-]+)/, '#$1')
        $(this).attr('href', href);
      })
      if (window.location.hash) {
        const hash = window.location.hash;
        window.location.hash = "";
        window.location.hash = hash;
        console.log('set hash', window.location.hash);
      }
    }
  }
}

function fixContent(html) {
  return html
    .replaceAll('href="https://superbowl.substack.com/feed#', 'href="#')
    .replaceAll('href="https://superbowl.substack.com/p/', 'href="/p/')
    .replace(/<br><br><img src="[^>]*" \/>/, '')
}
