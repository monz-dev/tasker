import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { AutoLogout } from '@/components/AutoLogout';
import { useAuth } from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('AutoLogout', () => {
  const mockSignOut = vi.fn();
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location
    // @ts-ignore
    delete window.location;
    window.location = {
      href: '',
    } as any;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    vi.useFakeTimers();
    mockSignOut.mockReset();
    window.location.href = '';
    
    // Default mock behavior: user is logged in
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not do anything if user is not logged in', () => {
    // Mock no user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(<AutoLogout />);

    // Fast-forward 2 minutes (120000ms)
    vi.advanceTimersByTime(120000);

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
    
    // Verify no activity events were registered
    const registeredEvents = addEventListenerSpy.mock.calls.map(call => call[0]);
    expect(registeredEvents).not.toContain('mousemove');
    
    addEventListenerSpy.mockRestore();
  });

  it('should register event listeners when user is logged in', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(<AutoLogout />);

    const registeredEvents = addEventListenerSpy.mock.calls.map(call => call[0]);
    expect(registeredEvents).toContain('mousemove');
    expect(registeredEvents).toContain('keydown');
    expect(registeredEvents).toContain('click');
    expect(registeredEvents).toContain('scroll');

    addEventListenerSpy.mockRestore();
  });

  it('should sign out and redirect to /login after 2 minutes of inactivity', async () => {
    render(<AutoLogout />);

    // Advance time by 115 seconds (115000ms) - just under 2 minutes
    vi.advanceTimersByTime(115000);
    expect(mockSignOut).not.toHaveBeenCalled();

    // Advance past the 2 minutes mark (120000ms total)
    vi.advanceTimersByTime(5000);
    
    // Give promises time to settle
    await vi.runAllTicks();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/login');
  });

  it('should reset inactivity timer on activity events', async () => {
    render(<AutoLogout />);

    // Advance time by 90 seconds (90000ms)
    vi.advanceTimersByTime(90000);
    expect(mockSignOut).not.toHaveBeenCalled();

    // Trigger user activity
    window.dispatchEvent(new MouseEvent('mousemove'));

    // Advance time by another 90 seconds (180000ms total elapsed, but only 90s since activity)
    vi.advanceTimersByTime(90000);
    expect(mockSignOut).not.toHaveBeenCalled();

    // Now let it time out by advancing 30 seconds more (120s since last activity)
    vi.advanceTimersByTime(30000);
    
    await vi.runAllTicks();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/login');
  });

  it('should log out immediately on visibility change if already inactive', async () => {
    render(<AutoLogout />);

    // Mock Date.now to be 120 seconds later
    const now = Date.now();
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(now + 120000);
    
    // Stub document.visibilityState
    const visibilityStateSpy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    
    // Dispatch visibility change
    document.dispatchEvent(new Event('visibilitychange'));

    await vi.runAllTicks();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/login');

    dateNowSpy.mockRestore();
    visibilityStateSpy.mockRestore();
  });

  it('should clean up event listeners and intervals on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<AutoLogout />);

    unmount();

    const removedEvents = removeEventListenerSpy.mock.calls.map(call => call[0]);
    expect(removedEvents).toContain('mousemove');
    expect(removedEvents).toContain('keydown');
    expect(removedEvents).toContain('click');
    expect(removedEvents).toContain('scroll');

    removeEventListenerSpy.mockRestore();
  });
});
