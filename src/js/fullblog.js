// src/js/fullblog.js
// Fetch and display the selected blog post
document.addEventListener('DOMContentLoaded', () => {
    const blogTitle = document.getElementById('post-title');
    const blogContent = document.getElementById('post-content');
  
    // CORS Proxy URL
    const CORS_PROXY = 'https://birdburgerblog.tommycbird.workers.dev/?url=';
    const NOTION_VERSION = '2022-06-28';
  
    // Fetch page properties
    async function fetchPost(postId) {
      try {
        const pageUrl = `https://api.notion.com/v1/pages/${postId}`;
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(pageUrl)}`, {
          method: 'GET',
          headers: {
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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', // Include Authorization header
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Post data:', data); // Debug log for fetched post data
        return data;
      } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
      }
    }
  
    // Fetch blocks of the page
    async function fetchBlocks(blockId) {
      try {
        const blocksUrl = `https://api.notion.com/v1/blocks/${blockId}/children`;
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(blocksUrl)}`, {
          method: 'GET',
          headers: {
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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', // Include Authorization header
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Fetched blocks:', data.results); // Debug log for fetched blocks
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
          if (text.annotations.bold) content = `<strong>${content}</strong>`;
          if (text.annotations.italic) content = `<em>${content}</em>`;
          if (text.annotations.underline) content = `<u>${content}</u>`;
          if (text.annotations.strikethrough) content = `<s>${content}</s>`;
          if (text.annotations.code) content = `<code>${content}</code>`;
        }
        if (text.text.link) {
          content = `<a href="${text.text.link.url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
        }
        return content;
      }).join('');
    }
  
    // Render blocks to HTML
    async function renderBlocks(blocks) {
      let content = '';
      let inList = false;
      let listType = ''; // 'ul' or 'ol'
  
      for (const block of blocks) {
        try {
          if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
            const currentListType = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
            if (!inList) {
              inList = true;
              listType = currentListType;
              content += `<${listType}>`;
            } else if (listType !== currentListType) {
              content += `</${listType}><${currentListType}>`;
              listType = currentListType;
            }
            content += `<li>${renderRichText(block[block.type].rich_text)}</li>`;
          } else {
            if (inList) {
              content += `</${listType}>`;
              inList = false;
              listType = '';
            }
  
            switch (block.type) {
              case 'paragraph':
                content += `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
                break;
              case 'heading_1':
                content += `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
                break;
              case 'heading_2':
                content += `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
                break;
              case 'heading_3':
                content += `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
                break;
              case 'image':
                const imageUrl = block.image.file ? block.image.file.url : block.image.external.url;
                const altText = block.image.caption.length > 0 ? renderRichText(block.image.caption) : 'Image';
                content += `<img src="${imageUrl}" alt="${altText}" class="full-blog-image" />`;
                break;
              case 'quote':
                content += `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;
                break;
              default:
                console.warn(`Unsupported block type: ${block.type}`);
            }
          }
  
          if (block.has_children) {
            const children = await fetchBlocks(block.id);
            content += await renderBlocks(children);
          }
        } catch (err) {
          console.error(`Error rendering block ${block.id}:`, err);
        }
      }
  
      if (inList) {
        content += `</${listType}>`;
      }
  
      return content;
    }
  
  async function displayPost() {
    const postId = localStorage.getItem('selectedPostId');
    if (!postId) return;
    try {
      const post = await fetchPost(postId);
      const title = post.properties.Post.title[0].text.content;
      const date = post.properties.Date.date.start;

      blogTitle.textContent = title;
      const blogTimestamp = document.getElementById('post-date');
      blogTimestamp.textContent = new Date(date).toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          hour12: true
      });
    

      const blocks = await fetchBlocks(postId);
      const renderedBlocks = await renderBlocks(blocks);
      blogContent.innerHTML = renderedBlocks;
    } catch (error) {
      console.error(error);
    }
  }

  
    displayPost();
  });
  