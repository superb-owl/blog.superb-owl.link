import * as cheerio from 'cheerio';

export async function getPosts() {
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
  }
  return posts;
}

export async function fillDetails(post) {
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

  const comments = $('.comments-section-title').text();
  try {
    post.comments = parseInt(comments.replace(" Comments", ''));
  } catch (e) {
    console.log("couldn't find comments", post.story_permalink, e);
  }

  const likes = $('.like-button-container .label').first().text();
  try {
    post.likes = parseInt(likes)
  } catch (e) {
    console.log("couldn't find comments", post.story_permalink, e);
  }

  return true;
}


