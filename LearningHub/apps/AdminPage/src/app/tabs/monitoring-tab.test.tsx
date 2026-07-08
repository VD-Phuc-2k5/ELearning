import React from 'react';
import { render, screen } from '@testing-library/react';
import { MonitoringTab } from './monitoring-tab';

describe('AdminPage — MonitoringTab', () => {
  it('renders system status card', () => {
    render(<MonitoringTab />);
    expect(screen.getByText('TRỰC TUYẾN')).toBeTruthy();
    expect(screen.getByText('Hệ thống')).toBeTruthy();
  });

  it('renders online status indicator', () => {
    render(<MonitoringTab />);
    expect(screen.getByText('Đang hoạt động ổn định')).toBeTruthy();
  });

  it('renders visit count card', () => {
    render(<MonitoringTab />);
    expect(screen.getByText('Lượt truy cập')).toBeTruthy();
    expect(screen.getByText('1,248')).toBeTruthy();
  });

  it('renders security alert card', () => {
    render(<MonitoringTab />);
    expect(screen.getByText('Cảnh báo bảo mật')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('100% Bảo mật')).toBeTruthy();
  });

  it('renders growth percentage', () => {
    render(<MonitoringTab />);
    expect(screen.getByText('+12% so với tháng trước')).toBeTruthy();
  });
});
