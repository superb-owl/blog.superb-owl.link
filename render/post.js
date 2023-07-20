import * as fs from 'fs';
import * as cheerio from 'cheerio';
const index = fs.readFileSync('./index.html').toString();

export function renderPost(post) {
  const $ = cheerio.load(index);
  $('body').addClass('post-view');
  let commentsMsg = "Join the discussion on Substack!";
  if (post.comments > 1) {
    commentsMsg = post.comments + " comments on Substack. Join the discussion!";
  } else if (post.comments) {
    commentsMsg = "1 comment on Substack. Join the discussion!";
  }
  $("#post").append(`
    <hr>
    <h1 class="title">${post.story_title}</h1>
    <h3 class="subtitle">${post.description}</h3>
    <a class="substack-link" href="${post.story_permalink}">View on Substack</a>
    <hr>
    ${fixContent(post.story_content)}
    <hr>
    <a href="${post.story_permalink}/comments">
      ${commentsMsg}
    </a>
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
  $('a[href^="https://superbowl.substack.com/i/"]').each(function() {
    let href = $(this).attr('href');
    href = href.replace(/https:\/\/superbowl\.substack\.com\/i\/\w+\/([\w-]+)/, '#$1')
    $(this).attr('href', href);
  })
  return $.html();
}

function fixContent(html) {
  return html
    .replaceAll('href="https://superbowl.substack.com/feed#', 'href="#')
    .replaceAll('href="https://superbowl.substack.com/p/', 'href="/p/')
    .replace(/<br><br><img src="[^>]*" \/>/, '')
}

