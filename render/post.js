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
  $("title").text(post.title + " - " + "Superb Owl");
  $("head").append(`
        <meta name="author" content="Max Goodbird">
        <meta property="og:type" content="article">
        <link rel="alternate" type="application/rss+xml" href="https://superbowl.substack.com/feed" title="Superb Owl"/>

        <link rel="canonical" href="https://blog.superb-owl.link/p/${post.id}" />
        <meta property="og:url" content="https://blog.superb-owl.link/p/${post.id}" />
        <meta property="og:title" content="${post.title}">
        <meta name="twitter:title" content="${post.title}">
        <meta name="description" content="${post.description}">
        <meta property="og:description" content="${post.description}">
        <meta name="twitter:description" content="${post.description}">
        <meta property="og:image" content="${post.image}">
        <meta name="twitter:image" content="${post.image}">
        <meta name="twitter:card" content="summary_large_image">
  `);
  $("#post").append(`
    <hr class="post-title-top">
    <h1 class="post-title">${post.title}</h1>
    <h3 class="post-subtitle">${post.description}</h3>
    <a class="substack-link" href="${post.story_permalink}">View on Substack</a>
    <hr class="post-title-bottom">
    ${fixContent(post)}
    ${post.paidOnly
      ? '<div class="paywall">This post is for paid subscribers. <a href="' + post.story_permalink + '">Visit Substack to finish reading</a>.</div>'
      : ''
    }
    <hr>
    <a href="${post.story_permalink}/comments">
      ${commentsMsg}
    </a>
  `);
  $('a[href="https://superbowl.substack.com/subscribe"]').replaceWith(`
  <iframe class="subscribe-embed" src="https://superbowl.substack.com/embed" height="80" width="480" frameborder="0" scrolling="no"></iframe>
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

function fixContent(post) {
  let html = post.story_content;
  if (post.paidOnly) {
    html = html.replace(new RegExp(`\n[ ]+Read more\n[ ]+`), "")
  }
  return html
    .replaceAll('href="https://superbowl.substack.com/feed#', 'href="#')
    .replaceAll('href="https://superbowl.substack.com/p/', 'href="/p/')
    .replaceAll(/href="\/p\/([0-9a-f-]+)"/g, 'href="https://superbowl.substack.com/p/$1"') // move back hidden links
    .replace(/<br><br><img src="[^>]*" \/>/, '')
}

