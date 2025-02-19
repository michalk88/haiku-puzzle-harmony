
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HaikuPuzzle from '../HaikuPuzzle';
import { useHaikuData } from '@/hooks/useHaikuData';
import { useHaikuGame } from '@/hooks/useHaikuGame';

// Mock the custom hooks
vi.mock('@/hooks/useHaikuData', () => ({
  useHaikuData: vi.fn()
}));

vi.mock('@/hooks/useHaikuGame', () => ({
  useHaikuGame: vi.fn()
}));

describe('HaikuPuzzle', () => {
  // Mock data
  const mockHaiku = {
    id: 1,
    title: 'Test Haiku',
    line1_words: ['gentle', 'morning', 'sun'],
    line2_words: ['breeze', 'whispers', 'through', 'trees'],
    line3_words: ['peaceful', 'day', 'begins']
  };

  const mockHaikuData = {
    haikus: [mockHaiku],
    completedHaikus: [],
    isLoadingHaikus: false,
    isLoadingCompleted: false,
    resetMutation: {
      mutate: vi.fn(),
      isPending: false
    }
  };

  // Setup base mock implementation for useHaikuGame
  const mockHandleWordReturn = vi.fn();
  const mockHandleWordUse = vi.fn();
  const mockUsedWords = new Set<string>();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockUsedWords.clear();

    // Mock useHaikuData implementation
    (useHaikuData as ReturnType<typeof vi.fn>).mockReturnValue(mockHaikuData);

    // Mock useHaikuGame implementation
    (useHaikuGame as ReturnType<typeof vi.fn>).mockReturnValue({
      draggedWord: '',
      usedWords: mockUsedWords,
      currentHaikuIndex: 0,
      isSolved: false,
      encouragingMessage: '',
      isMessageVisible: false,
      handleDragStart: vi.fn(),
      handleWordUse: mockHandleWordUse,
      handleWordReturn: mockHandleWordReturn,
      handleReset: vi.fn(),
      handleSolved: vi.fn(),
      handleNextHaiku: vi.fn(),
      handlePreviousHaiku: vi.fn(),
    });
  });

  it('should properly handle word return from haiku lines to word pool', async () => {
    render(<HaikuPuzzle />);

    // Simulate dragging a word from pool to haiku line
    const word = 'gentle';
    
    // Simulate drag start
    fireEvent.dragStart(screen.getByText(word), {
      dataTransfer: { setData: () => {} }
    });

    // Simulate drop on first line
    const firstLine = screen.getAllByRole('region')[0];
    fireEvent.drop(firstLine, {
      dataTransfer: { getData: () => word }
    });

    // Verify word was added to usedWords
    expect(mockHandleWordUse).toHaveBeenCalledWith(word);
    
    // Simulate dragging word back to pool
    fireEvent.dragStart(screen.getByText(word), {
      dataTransfer: { 
        setData: () => {},
        getData: () => word
      }
    });

    // Find word pool and simulate drop
    const wordPool = screen.getByRole('region', { name: /word pool/i });
    fireEvent.drop(wordPool, {
      dataTransfer: { getData: () => word }
    });

    // Verify word was removed from usedWords
    expect(mockHandleWordReturn).toHaveBeenCalledWith(word);
    
    // Verify word appears back in the pool
    expect(screen.getByText(word)).toBeInTheDocument();
  });
});
