// src/js/blog.js
// Load and display Medium blogs from RSS feed, filtered by approved authors

document.addEventListener('DOMContentLoaded', () => {
    const blogList = document.getElementById('blog-list');

    // Approved authors list
    const approvedAuthors = ['tommycbird', 'ddaugbjerg'];

    // Medium RSS feed URL
    const rssFeedUrl = 'https://medium.com/feed/tag/birdburger';

    // rss2json API endpoint (you can get a free API key from rss2json.com if needed)
    const rss2jsonApi = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;

    // Function to fetch and display blogs
    fetch(rss2jsonApi)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'ok') {
                throw new Error('Failed to fetch RSS feed');
            }

            const items = data.items;

            // Filter items by approved authors
            const filteredItems = items.filter(item => {
                // Extract username from the link
                // Example link: https://medium.com/@ddaugbjerg/test-post-67fbbdb79a27
                const linkParts = item.link.split('/');
                const usernamePart = linkParts.find(part => part.startsWith('@'));
                if (usernamePart) {
                    const username = usernamePart.substring(1); // Remove '@'
                    return approvedAuthors.includes(username.toLowerCase());
                }
                return false;
            });

            // Check if there are no articles
            if (filteredItems.length === 0) {
                blogList.innerHTML = '<p>No articles found for the approved authors.</p>';
                return;
            }

            // Display each filtered blog
            filteredItems.forEach(item => {
                const blogDiv = document.createElement('div');
                blogDiv.classList.add('blog-instance');

                const title = document.createElement('h2');
                title.textContent = item.title;

                const text = document.createElement('p');
                // Extract the snippet from the description
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description;
                const snippet = tempDiv.querySelector('.medium-feed-snippet')?.textContent || 'No preview available.';
                text.textContent = snippet;

                const readMore = document.createElement('button');
                readMore.textContent = 'Read more';
                readMore.classList.add('read-more-button');
                readMore.addEventListener('click', () => {
                    // Store the article data in localStorage
                    localStorage.setItem('selectedArticle', JSON.stringify(item));
                    // Navigate to the full blog page
                    window.location.href = '/pages/blog/blog_full.html';
                });

                blogDiv.appendChild(title);
                blogDiv.appendChild(text);
                blogDiv.appendChild(readMore);

                blogList.appendChild(blogDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching the RSS feed:', error);
            blogList.innerHTML = '<p>Failed to load blog posts. Please try again later.</p>';
        });
});
