// src/js/fullblog.js
// Fetch and display the selected blog post
document.addEventListener('DOMContentLoaded', () => {
    const blogTitle = document.getElementById('post-title');
    const blogContent = document.getElementById('post-content');

    const CORS_PROXY = 'https://thingproxy.freeboard.io/fetch/';
    const NOTION_API_KEY = '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';
    const NOTION_VERSION = '2022-06-28';

    // Fetch page properties
    async function fetchPost(postId) {
        try {
            const response = await fetch(`${CORS_PROXY}https://api.notion.com/v1/pages/${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': NOTION_VERSION,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    // Fetch blocks of the page
    async function fetchBlocks(blockId) {
        try {
            const response = await fetch(`${CORS_PROXY}https://api.notion.com/v1/blocks/${blockId}/children`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': NOTION_VERSION,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching blocks:', error);
            throw error;
        }
    }

    // Render rich text with annotations
    function renderRichText(richTexts) {
        return richTexts.map(text => {
            let content = text.plain_text;
            if (text.annotations) {
                if (text.annotations.bold) {
                    content = `<strong>${content}</strong>`;
                }
                if (text.annotations.italic) {
                    content = `<em>${content}</em>`;
                }
                if (text.annotations.underline) {
                    content = `<u>${content}</u>`;
                }
                if (text.annotations.strikethrough) {
                    content = `<s>${content}</s>`;
                }
                if (text.annotations.code) {
                    content = `<code>${content}</code>`;
                }
            }
            if (text.text.link) {
                content = `<a href="${text.text.link.url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
            }
            return content;
        }).join('');
    }

    // Render blocks to HTML
    function renderBlock(block) {
        switch (block.type) {
            case 'paragraph':
                if (!block.paragraph.rich_text.length) return ''; // Skip empty paragraphs
                return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
            case 'heading_1':
                return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
            case 'heading_2':
                return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
            case 'heading_3':
                return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
            case 'image':
                const imageUrl = block.image.file ? block.image.file.url : (block.image.external ? block.image.external.url : '');
                const altText = block.image.caption.length > 0 ? renderRichText(block.image.caption) : 'Image';
                return `<img src="${imageUrl}" alt="${altText}" class="full-blog-image" />`;
            case 'bulleted_list_item':
                return `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`;
            case 'numbered_list_item':
                return `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`;
            case 'quote':
                return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;
            // Add more cases as needed for other block types
            default:
                return ''; // Skip unsupported block types
        }
    }

    // Fetch and render all blocks recursively
    async function renderBlocks(blocks) {
        let content = '';
        let inList = false;
        let listType = ''; // 'ul' or 'ol'

        for (const block of blocks) {
            if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
                const currentListType = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
                if (!inList) {
                    inList = true;
                    listType = currentListType;
                    content += `<${listType}>`;
                } else if (listType !== currentListType) {
                    // Close the previous list and start a new one
                    content += `</${listType}><${currentListType}>`;
                    listType = currentListType;
                }
                content += renderBlock(block);
            } else {
                if (inList) {
                    // Close any open list
                    content += `</${listType}>`;
                    inList = false;
                    listType = '';
                }
                content += renderBlock(block);
            }

            if (block.has_children) {
                const children = await fetchBlocks(block.id);
                content += await renderBlocks(children);
            }
        }

        if (inList) {
            // Close any open list at the end
            content += `</${listType}>`;
        }

        return content;
    }

    async function displayPost() {
        const postId = localStorage.getItem('selectedPostId');
        if (!postId) {
            blogTitle.textContent = 'Post Not Found';
            blogContent.innerHTML = '<p>No post selected.</p>';
            return;
        }

        try {
            const post = await fetchPost(postId);
            const title = post.properties.Post.title[0].text.content;
            const date = post.properties.Date.date.start;
            const thumbnail = post.properties.Thumbnail.files[0].file.url;
            const slug = post.properties.Slug.rich_text[0].text.content;
            const postUrl = post.url;

            blogTitle.textContent = title;

            let contentHtml = `
                <div class="full-content">
                    <img src="${thumbnail}" alt="${slug}" class="full-blog-image" />
                    <div class="blog-meta">
                        <span class="blog-date">${new Date(date).toLocaleDateString()}</span>
                    </div>
            `;

            const blocks = await fetchBlocks(postId);
            const renderedBlocks = await renderBlocks(blocks);
            contentHtml += renderedBlocks;

            // contentHtml += `
            //         <p><a href="${postUrl}" target="_blank" rel="noopener noreferrer">Read the full article on Notion »</a></p>
            //     </div>
            // `;

            blogContent.innerHTML = contentHtml;
        } catch (error) {
            console.error('Error displaying post:', error);
            blogTitle.textContent = 'Error';
            blogContent.innerHTML = '<p>Failed to load the post.</p>';
        }
    }

    displayPost();
});
