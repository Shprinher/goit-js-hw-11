// https://pixabay.com/api/?key=36676558-52c99867405fc59051d9850ec&q="${value}"&image_type="photo"&orientation="horizontal"&safesearch= "true"

import './sass/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '36676558-52c99867405fc59051d9850ec';

const searchForm = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

let currentPage = 1;
let currentQuery = '';
let images = []; 

let lightbox;

const searchImages = async (query, page = 1) => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    const { hits, totalHits } = response.data;
    const totalPages = Math.ceil(totalHits / 40) + 1;

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (page === 1) {
      gallery.innerHTML = '';
      images = []; 
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    hits.forEach((image) => {
      const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

      const card = document.createElement('div');
      card.classList.add('photo-card');

      const a = document.createElement('a');
      a.href = largeImageURL;
      a.classList.add('lightbox-link');

      const img = document.createElement('img');
      img.src = webformatURL;
      img.alt = tags;
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.classList.add('info');

      const likesElement = createInfoItem('Likes', likes);
      const viewsElement = createInfoItem('Views', views);
      const commentsElement = createInfoItem('Comments', comments);
      const downloadsElement = createInfoItem('Downloads', downloads);

      info.append(likesElement, viewsElement, commentsElement, downloadsElement);
      a.appendChild(img);
      card.append(a, info);
      gallery.appendChild(card);

      images.push(card); 
    });

    if (page === 1) {
      lightbox = new SimpleLightbox('.lightbox-link', { captionsData: "alt", captionDelay: "250" });
    } else {
      lightbox.refresh();
    }
    currentPage++;
    toggleLoadMoreBtn((currentPage === totalPages && hits.length <= 40) || hits.length >= totalHits);
  } catch (error) {
    console.log('Error:', error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again later.');
  }
};

const createInfoItem = (label, value) => {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}: </b>${value}`;
  return item;
};

const toggleLoadMoreBtn = (hide) => {
  if (hide) {
    loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  } else {
    loadMoreBtn.classList.remove('hidden');
  }
};

loadMoreBtn.classList.add('hidden');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = event.target.elements.searchQuery.value.trim();

  if (query === '') {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  currentQuery = query;
  currentPage = 1;
  searchImages(currentQuery, currentPage);
});

loadMoreBtn.addEventListener('click', () => {
  searchImages(currentQuery, currentPage);
});
