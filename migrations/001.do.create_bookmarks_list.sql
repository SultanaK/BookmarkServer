drop table if exists bookmarks_list;

CREATE TABLE bookmarks_list (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    rating TEXT NOT NULL
);
