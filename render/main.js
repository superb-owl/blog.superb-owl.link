import * as fs from 'fs';
import * as cheerio from 'cheerio';
import * as home from './home.js';
import * as post from './post.js';
import * as download from './download.js';

const DIST_DIR = './dist';
const POST_DIR = DIST_DIR + '/p';
[DIST_DIR, POST_DIR].forEach(dir => {
  try {
    fs.rmdirSync(dir, {recursive: true});
  } catch (e) {}
  fs.mkdirSync(dir);
});

const STATIC_FILES = ['styles.css', 'favicon.ico', 'logo.png', 'main.js'];
STATIC_FILES.forEach(f => {
  fs.copyFileSync(f, DIST_DIR + '/' + f);
});

(async function() {
  let posts = await download.getPosts();
  home.renderHome(posts);
  fs.writeFileSync(DIST_DIR + '/index.html', home.renderHome(posts))
  posts.forEach(p => {
    fs.mkdirSync(POST_DIR + '/' + p.id);
    fs.writeFileSync(POST_DIR + '/' + p.id + '/index.html', post.renderPost(p))
  });
})();
