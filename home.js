const OWL_IMAGES = ['2F2dc69925', 'c6edb0b1', '2F77f9b936', '2Fbdba1fbd'];

async function loadHome() {
  let posts = [];
  let page = 1;
  while (true) {
    let resp = await fetch('https://newsblur.com/reader/feed/8737923?page=' + page);
    resp = await resp.json();
    if (resp.stories.length === 0) break;
    page++;
    for (let i = 0; i < resp.stories.length; ++i) {
      const story = resp.stories[i];
      try {
        await fillDetails(story);
      } catch (e) {
        console.log('error filling details for', story.story_permalink);
        continue;
      }
      $("#posts").append(getPostHTML(story));
    }
    posts = posts.concat(resp.stories);
    console.log(posts.length);
  }
  console.log('all', posts);
}

function getPostHTML(post) {
  console.log(post)
  const date = new Date(Date.parse(post.story_date));
  return `
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
`;
}

