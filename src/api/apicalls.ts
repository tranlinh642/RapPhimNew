const apikey: string = '56eca54aed68308aedd28e915885391d'; // Nên dùng biến môi trường

export const baseImagePath = (size: string, path: string): string => {
  if (!path) return ''; // Tránh lỗi nếu path rỗng
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const nowPlayingMovies = (region?: string, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}`;
  if (region) url += `&region=${region}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const upcomingMovies = (region?: string, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}`;
  if (region) url += `&region=${region}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const popularMovies = (region?: string, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}`;
  if (region) url += `&region=${region}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const searchMovies = (keyword: string, region?: string, language?: string): string => {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(keyword)}`;
  if (region) url += `&region=${region}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const movieDetails = (id: number, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const movieCastDetails = (id: number, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apikey}`;
  if (language) url += `&language=${language}`;
  return url;
};

export const movieVideos = (id: number, language?: string): string => {
  let url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apikey}`;
  if (language) url += `&language=${language}`; // Bạn có thể thêm ngôn ngữ nếu muốn trailer theo ngôn ngữ cụ thể
  return url;
};