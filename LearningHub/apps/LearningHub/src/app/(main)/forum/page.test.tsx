import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForumListPage from './page';
import { listForums } from '../../actions/forum.actions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

jest.mock('next/link', () => {
  return function Link({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('../../../components/ui', () => ({
  Button: ({ children, isLoading, ...props }: any) => (
    <button {...props} disabled={isLoading || props.disabled}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

jest.mock('../../actions/forum.actions', () => ({
  listForums: jest.fn(),
  updateForum: jest.fn(),
}));

const mockListForums = listForums as jest.MockedFunction<typeof listForums>;

const mockForums = {
  data: [
    {
      id: 'forum-1',
      name: 'General Discussion',
      slug: 'general-discussion',
      description: 'Chat about anything',
      visibility: 'public',
      memberCount: 42,
      postCount: 128,
      bannerUrl: null,
      iconUrl: null,
    },
    {
      id: 'forum-2',
      name: 'Tech Help',
      slug: 'tech-help',
      description: null,
      visibility: 'private',
      memberCount: 15,
      postCount: 37,
      bannerUrl: null,
      iconUrl: null,
    },
  ],
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ForumListPage />
    </QueryClientProvider>,
  );
}

describe('LearningHub — ForumListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListForums.mockResolvedValue(mockForums as any);
  });

  it('renders heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Forum' })).toBeTruthy();
    });
  });

  it('renders forum names after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeTruthy();
      expect(screen.getByText('Tech Help')).toBeTruthy();
    });
  });

  it('renders visibility badges', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('public')).toBeTruthy();
      expect(screen.getByText('private')).toBeTruthy();
    });
  });

  it('renders member and post counts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('42')).toBeTruthy();
      expect(screen.getByText('128')).toBeTruthy();
    });
  });

  it('renders new forum link', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /new forum/i })).toBeTruthy();
    });
  });

  it('renders empty state when no forums', async () => {
    mockListForums.mockResolvedValue({ data: [] } as any);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No forums yet')).toBeTruthy();
    });
  });

  it('renders error state when listForums fails', async () => {
    mockListForums.mockRejectedValue(new Error('Network Error'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Failed to load forums')).toBeTruthy();
    });
  });
});
