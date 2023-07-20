import * as fs from 'fs';
import * as cheerio from 'cheerio';

const DIST_DIR = './dist';
const POST_DIR = DIST_DIR + '/p';
[DIST_DIR, POST_DIR].forEach(dir => {
  try {
    fs.rmdirSync(dir, {recursive: true});
  } catch (e) {}
  fs.mkdirSync(dir);
});

const STATIC_FILES = ['styles.css', 'favicon.ico', 'logo.png'];
STATIC_FILES.forEach(f => {
  fs.copyFileSync(f, DIST_DIR + '/' + f);
});

const index = fs.readFileSync('./index.html').toString();

async function getPosts() {
  let posts = [];
  let page = 1;
  while (true) {
    let resp = await fetch('https://newsblur.com/reader/feed/8737923?page=' + page);
    resp = await resp.json();
    if (resp.stories.length === 0) break;
    page++;
    for (let i = 0; i < resp.stories.length; ++i) {
      const story = resp.stories[i];
      const valid = await fillDetails(story);
      if (!valid) {
        console.log('story was removed or not found', story.story_permalink);
        continue;
      }
      posts.push(story);
    }
    console.log(posts.length);
  }
  return posts;
}

async function fillDetails(post) {
  console.log(post.story_permalink);
  const resp = await fetch(post.story_permalink);
  if (resp.status === 404) {
    return false
  }
  const html = await resp.text();
  const $ = cheerio.load(html);

  const imageMeta = $('meta[property="og:image"]');
  post.image = imageMeta.attr('content')
    .replace('f_jpg', 'f_auto')
    .replace(/h_\d+,/, '')
    .replace(/w_\d+,/, 'w_600,');

  const descMeta = $('h3.subtitle');
  post.description = descMeta.text();
  return true;
}

function renderHome(posts) {
  const $ = cheerio.load(index);
  posts.forEach(post => {
    const date = new Date(Date.parse(post.story_date));
    $("#posts").append(`
      <div class="post">
        <h3>
          <a href="${post.story_permalink.replace('https://superbowl.substack.com', '')}">${post.story_title}</a>
        </h3>
        <div class="subheading description">
          ${post.description}
        </div>
        <div class="subheading date">
          ${date.toDateString()}
        </div>
        <div class="image-holder">
          <a href="${post.story_permalink}">
            <img src="${post.image}">
          </a>
        </div>
      </div>
      `);
  });
  fs.writeFileSync(DIST_DIR + '/index.html', $.html())
}

function renderPost(post) {
  const $ = cheerio.load(index);
  $('body').addClass('post-view');
  $("#post").append(`
    <hr>
    <h1 class="title">${post.story_title}</h1>
    <h3 class="subtitle">${post.description}</h3>
    <a class="substack-link" href="${post.story_permalink}">View on Substack</a>
    <hr>
    ${fixContent(post.story_content)}
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
  const postID = post.story_permalink
    .replace(/^.*\/p\/([\w-]+).*$/, '$1');
  fs.mkdirSync(POST_DIR + '/' + postID);
  fs.writeFileSync(POST_DIR + '/' + postID + '/index.html', $.html())
}

function fixContent(html) {
  return html
    .replaceAll('href="https://superbowl.substack.com/feed#', 'href="#')
    .replaceAll('href="https://superbowl.substack.com/p/', 'href="/p/')
    .replace(/<br><br><img src="[^>]*" \/>/, '')
}

(async function() {
  let posts = await getPosts();
  renderHome(posts);
  posts.forEach(p => renderPost(p));
})();
