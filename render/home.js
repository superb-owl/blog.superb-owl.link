import * as fs from 'fs';
import * as cheerio from 'cheerio';
const index = fs.readFileSync('./index.html').toString();

export function renderHome(posts) {
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
  return $.html();
}

