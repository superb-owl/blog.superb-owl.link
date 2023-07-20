import * as fs from 'fs';
import * as cheerio from 'cheerio';
const index = fs.readFileSync('./index.html').toString();

export function renderHome(posts) {
  const $ = cheerio.load(index);
  $("head").append(`
        <meta name="author" content="Max Goodbird">
        <meta property="og:url" content="https://blog.superb-owl.link/" />
        <meta name="theme-color" content="#14101b">
        <meta property="og:image" content="https://blog.superb-owl.link/logo.png">
        <meta name="twitter:image" content="https://blog.superb-owl.link/logo.png">
        <meta name="twitter:card" content="summary_large_image">
        <meta property="og:title" content="Superb Owl">
        <meta name="twitter:title" content="Superb Owl">
        <meta name="description" content="Exploring the gaps between Science and Spirituality.">
        <meta property="og:description" content="Exploring the gaps between Science and Spirituality.">
        <meta name="twitter:description" content="Exploring the gaps between Science and Spirituality.">
  `);
  posts.forEach(post => {
    const date = new Date(Date.parse(post.story_date));
    $("#posts").append(`
      <div class="post">
        <h3>
          <a href="${post.story_permalink.replace('https://superbowl.substack.com', '')}">
            ${post.title}
          </a>
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

