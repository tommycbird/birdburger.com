// src/js/blog.js
// Loads in notion blogs from the Notion API and displays them on the blog page
document.addEventListener('DOMContentLoaded', () => {
    const blogList = document.getElementById('blog-list');

    const CORS_PROXY = 'https://thingproxy.freeboard.io/fetch/';
    const NOTION_API_URL = `https://api.notion.com/v1/databases/164642b6-35d9-8064-b6a9-d15f3f0228f4/query`;
    const NOTION_API_KEY = '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';

    // Fetch and display blog posts
    async function fetchBlogPosts() {
        try {
            const response = await fetch(`${CORS_PROXY}${NOTION_API_URL}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "filter": {
                        "property": "Live",
                        "checkbox": {
                            "equals": true
                        }
                    },
                    "sorts": [
                        {
                            "property": "Date",
                            "direction": "descending"
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }
    }

    async function displayBlogPosts() {
        try {
            const posts = await fetchBlogPosts();
            if (posts.length === 0) {
                blogList.innerHTML = '<p>No live articles found.</p>';
                return;
            }

            posts.forEach(post => {
                const slug = post.properties.Slug.rich_text[0].text.content;
                const thumbnail = post.properties.Thumbnail.files[0].file.url;
                const date = post.properties.Date.date.start;

                const blogItem = document.createElement('div');
                blogItem.classList.add('blog-instance');

                blogItem.innerHTML = `
                    <img src="${thumbnail}" alt="${slug}" class="blog-thumbnail" />
                    <div class="blog-content">
                        <div class="blog-header">
                            <h2 class="blog-title">${post.properties.Post.title[0].text.content}</h2>
                            <span class="blog-date">${new Date(date).toLocaleDateString()}</span>
                        </div>
                        <p class="blog-slug">${slug}</p>
                        <button class="read-more-button" onclick="readMore('${post.id}')">Read more</button>
                    </div>
                `;

                blogList.appendChild(blogItem);
            });
        } catch (error) {
            console.error('Error displaying blog posts:', error);
            blogList.innerHTML = '<p>Failed to load blog posts.</p>';
        }
    }

    window.readMore = function(postId) {
        localStorage.setItem('selectedPostId', postId);
        window.location.href = '/fullblog/index.html';
    }

    displayBlogPosts();
});
