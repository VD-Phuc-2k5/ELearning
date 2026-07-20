import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoadmapsPage from './page';
import { listRoadmaps, enrollRoadmap } from '../../actions/roadmap.actions';

jest.mock('@aejkatappaja/phantom-ui', () => ({}), { virtual: true });

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
  Button: ({ children, isLoading, icon: _icon, ...props }: any) => (
    <button {...props} disabled={isLoading || props.disabled}>
      {children}
    </button>
  ),
  Input: ({ error, label: _label, ...props }: any) => (
    <>
      <input {...props} />
      {error && <span>{error}</span>}
    </>
  ),
}));

jest.mock('../../actions/roadmap.actions', () => ({
  listRoadmaps: jest.fn(),
  enrollRoadmap: jest.fn(),
}));

const mockListRoadmaps = listRoadmaps as jest.MockedFunction<
  typeof listRoadmaps
>;
const mockEnrollRoadmap = enrollRoadmap as jest.MockedFunction<
  typeof enrollRoadmap
>;

const mockRoadmaps = {
  data: [
    {
      id: 'roadmap-1',
      title: 'React Fundamentals',
      description: 'Learn React from scratch',
      status: 'approved',
    },
    {
      id: 'roadmap-2',
      title: 'Node.js Backend',
      description: 'Build REST APIs',
      status: 'approved',
    },
    {
      id: 'roadmap-3',
      title: 'Draft Roadmap',
      description: null,
      status: 'draft',
    },
  ],
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <RoadmapsPage />
    </QueryClientProvider>,
  );
}

describe('LearningHub — RoadmapsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListRoadmaps.mockResolvedValue(mockRoadmaps as any);
    mockEnrollRoadmap.mockResolvedValue({} as any);
  });

  it('renders heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Learning Roadmaps' }),
      ).toBeTruthy();
    });
  });

  it('renders roadmap titles after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeTruthy();
      expect(screen.getByText('Node.js Backend')).toBeTruthy();
    });
  });

  it('renders descriptions', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Learn React from scratch')).toBeTruthy();
    });
  });

  it('renders status badges', async () => {
    renderPage();
    await waitFor(() => {
      const approvedBadges = screen.getAllByText('approved');
      expect(approvedBadges.length).toBe(2);
      expect(screen.getByText('draft')).toBeTruthy();
    });
  });

  it('renders View buttons for each roadmap', async () => {
    renderPage();
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      expect(viewButtons.length).toBe(3);
    });
  });

  it('renders Enroll buttons', async () => {
    renderPage();
    await waitFor(() => {
      const enrollButtons = screen.getAllByText('Enroll');
      expect(enrollButtons.length).toBe(3);
    });
  });

  it('clicking Enroll calls enrollRoadmap with roadmap id', async () => {
    renderPage();
    await waitFor(() => screen.getAllByText('Enroll'));
    const enrollButtons = screen.getAllByText('Enroll');
    fireEvent.click(enrollButtons[0]);
    await waitFor(() => {
      expect(mockEnrollRoadmap).toHaveBeenCalledWith('roadmap-1');
    });
  });

  it('has create roadmap link', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Create Roadmap')).toBeTruthy();
    });
  });

  it('renders empty state when no roadmaps', async () => {
    mockListRoadmaps.mockResolvedValue({ data: [] } as any);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No roadmaps yet')).toBeTruthy();
    });
  });

  it('renders roadmaps with null description without crash', async () => {
    mockListRoadmaps.mockResolvedValue({
      data: [mockRoadmaps.data[2]],
    } as any);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Draft Roadmap')).toBeTruthy();
    });
  });
});
