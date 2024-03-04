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
  post.id = post.story_permalink.replace(/^.*\/p\/([\w-]+).*$/, '$1');
  post.link = post.story_permalink.replace('https://superbowl.substack.com', '');
  const resp = await fetch(post.story_permalink);
  if (resp.status === 404) {
    return false
  }
  const html = await resp.text();
  post.original_html = html;
  const $ = cheerio.load(html);

  const imageMeta = $('meta[property="og:image"]');
  post.image = (imageMeta.attr('content') || '')
    .replace('f_jpg', 'f_auto')
    .replace(/h_\d+,/, '')
    .replace(/w_\d+,/, 'w_600,');

  const descMeta = $('h3.subtitle');
  post.description = descMeta.text();

  const titleMeta = $('meta[property="og:title"]');
  post.current_title = titleMeta.attr('content');
  post.title = post.current_title || post.story_title;

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

  post.paidOnly = !!$('.paywall').length;

  return true;
}


