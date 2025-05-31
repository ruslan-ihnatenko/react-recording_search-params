import { Link } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';

import { PostList } from '../components/PostList';
import { PostsContext } from '../store/PostsContext';
import { PostFilter } from '../components/PostFilter';
import { useSearchParams } from 'react-router-dom';

export const PostsPage: React.FC = () => {
  const { filteredPosts, applyFilters } = useContext(PostsContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const userId = +(searchParams.get('userId') || 0);
    const letters = searchParams.getAll('letters') || [];

    applyFilters({ query, userId, letters });
  }, [searchParams, applyFilters]);

  return (
    <div>
      <PostFilter />
      {filteredPosts.length > 0 ? (
        <PostList filteredPosts={filteredPosts} />
      ) : (
        <p>There are no posts yet</p>
      )}

      <Link to="new" className="button is-info">
        Create a post
      </Link>
    </div>
  );
};
