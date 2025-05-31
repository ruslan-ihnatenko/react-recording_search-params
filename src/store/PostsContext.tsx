/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Post } from '../types';
import * as postService from '../services/post';

type FilterParams = {
  query: string;
  userId: number;
  letters: string[];
};

export const PostsContext = React.createContext({
  posts: [] as Post[],
  filteredPosts: [] as Post[],
  loading: false,
  errorMessage: '',
  loadPosts: async (userId: number) => {},
  addPost: async (data: Omit<Post, 'id'>) => {},
  deletePost: async (id: number) => {},
  updatePost: async (post: Post) => {},
  applyFilters: (params: FilterParams) => {},
});

type Props = {
  children: React.ReactNode;
}

export const PostsProvider: React.FC<Props> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPosts(0);
  }, []);

  const loadPosts = useCallback((userId = 0) => {
    setLoading(true);

    return postService.getUserPosts(userId)
      .then(newPosts => {
        setPosts(newPosts);
        setFilteredPosts(newPosts);
      })
      .catch(() => setErrorMessage('Try again later'))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(({ query, userId, letters }: FilterParams) => {
    let result = [...posts];

    // Filter by userId
    if (userId) {
      result = result.filter(post => post.userId === userId);
    }

    // Filter by query (title search)
    if (query) {
      const normalizedQuery = query.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(normalizedQuery)
      );
    }

    // Filter by letters
    if (letters.length > 0) {
      result = result.filter(post => 
        letters.every(letter => 
          post.title.toLowerCase().includes(letter.toLowerCase())
        )
      );
    }

    setFilteredPosts(result);
  }, [posts]);

  const updatePostInList = useCallback((currentPosts: Post[], updatedPost: Post) => {
    const newPosts = [...currentPosts];
    const index = newPosts.findIndex(post => post.id === updatedPost.id);
    newPosts.splice(index, 1, updatedPost);
    return newPosts;
  }, []);

  const addPost = useCallback(({ title, body, userId }: Omit<Post, 'id'>) => {
    setErrorMessage('');

    return postService.createPost({ title, body, userId })
      .then(newPost => {
        setPosts(currentPosts => [...currentPosts, newPost]);
        setFilteredPosts(currentPosts => [...currentPosts, newPost]);
      })
      .catch((error) => {
        setErrorMessage(`Can't create a post`);
        throw error;
      });
  }, []);

  const deletePost = useCallback((postId: number) => {
    let prevPosts: Post[] = [];

    setPosts(currentPosts => {
      prevPosts = currentPosts;
      return currentPosts.filter(post => post.id !== postId);
    });

    setFilteredPosts(currentPosts => 
      currentPosts.filter(post => post.id !== postId)
    );

    return postService.deletePost(postId)
      .then(() => {})
      .catch((error) => {
        setPosts(prevPosts);
        setFilteredPosts(prevPosts);
        setErrorMessage(`Can't delete a post`);
        throw error;
      });
  }, []);

  const updatePost = useCallback((updatedPost: Post) => {
    setErrorMessage('');

    return postService.updatePost(updatedPost)
      .then(post => {
        setPosts(currentPosts => updatePostInList(currentPosts, post));
        setFilteredPosts(currentPosts => updatePostInList(currentPosts, post));
      })
      .catch((error) => {
        setErrorMessage(`Can't update a post`);
        throw error;
      });
  }, [updatePostInList]);

  const value = useMemo(() => ({
    posts,
    filteredPosts,
    loading,
    errorMessage,
    loadPosts,
    addPost,
    deletePost,
    updatePost,
    applyFilters
  }), [posts, filteredPosts, loading, errorMessage, loadPosts, addPost, deletePost, updatePost, applyFilters]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};
