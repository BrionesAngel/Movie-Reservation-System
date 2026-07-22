CREATE TABLE movie_genres (
    movie_id BIGINT NOT NULL REFERENCES movies(id),
    genre_id BIGINT NOT NULL REFERENCES genres(id),
    PRIMARY KEY (movie_id, genre_id)
);
