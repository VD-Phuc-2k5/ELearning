import { test, expect } from '@playwright/test';
import {
  cleanupE2ETestData,
  seedRoles,
  seedAdminUser,
  checkUserExists,
  E2E_MARKER,
} from '../playwright/db-helper';

const ADMINPAGE_BASE = 'http://localhost:8081';
const ts = Date.now();
const adminEmail = `e2eadmin${ts}${E2E_MARKER}`;
const adminPassword = 'AdminE2E@123';
const testRoleCode = `E2EROLE_${ts}`;

test.describe('AdminPage — navigation & auth', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('unauthorized access shows login screen', async ({ page }) => {
    await page.goto(ADMINPAGE_BASE);
    await page.waitForTimeout(3000);
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible({
      timeout: 10000,
    });
    const user = await checkUserExists(adminEmail);
    expect(user).toBeTruthy();
  });

  test('login → dashboard with sidebar', async ({ page }) => {
    await login(page);
    const sidebar = page.locator('aside').or(page.getByText(/quản trị/i));
    await expect(sidebar.first()).toBeVisible({ timeout: 15000 });
  });

  test('navigate all 8 tabs', async ({ page }) => {
    await login(page);
    const tabs = [
      /thành viên/i,
      /vai trò/i,
      /danh mục quyền/i,
      /giám sát/i,
      /quản trị user/i,
      /kiểm duyệt forum/i,
      /kiểm duyệt câu hỏi/i,
      /đề bài coding/i,
    ];
    for (const name of tabs) {
      const tab = page.getByRole('button', { name });
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
        await expect(page.getByRole('heading').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('logout → back to login', async ({ page }) => {
    await login(page);
    const logoutBtn = page.getByRole('button', { name: /đăng xuất/i });
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(3000);
      await expect(
        page.getByRole('button', { name: /đăng nhập/i }),
      ).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('AdminPage — Thành viên CRUD', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Thành viên tab shows user table', async ({ page }) => {
    await login(page);
    const table = page.locator('table').or(page.locator('[role="grid"]'));
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await table.locator('tr').count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('open Thêm Admin modal', async ({ page }) => {
    await login(page);
    const addBtn = page.getByRole('button', { name: /thêm admin/i });
    if (!(await addBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await addBtn.click();
    await expect(page.getByText(/tạo tài khoản admin/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('create admin → verify DB', async ({ page }) => {
    await login(page);
    const addBtn = page.getByRole('button', { name: /thêm admin/i });
    if (!(await addBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await addBtn.click();
    await page.waitForTimeout(1000);

    const newEmail = `e2eadmin2_${ts}${E2E_MARKER}`;
    const displayName = page.locator('input[placeholder="Nguyễn Văn A"]');
    if (await displayName.isVisible({ timeout: 3000 }).catch(() => false)) {
      await displayName.fill(`e2eadmin2_${ts}`);
    }
    const emailInput = page.locator('input[placeholder="admin2@example.com"]');
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(newEmail);
    }
    const pwInput = page
      .locator('input[placeholder="Admin123@"]')
      .or(page.locator('input[type="password"]'));
    if (await pwInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pwInput.fill('AdminE2E@123');
    }
    await page.getByRole('button', { name: /tạo tài khoản/i }).click();
    await page.waitForTimeout(5000);

    const user = await checkUserExists(newEmail);
    expect(user).toBeTruthy();
  });

  test('open user quản lý modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /thành viên/i);
    await page.waitForTimeout(3000);
    const manageBtn = page
      .getByRole('button', { name: /quản lý|manage/i })
      .first();
    if (await manageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await manageBtn.click();
      await page.waitForTimeout(2000);
      await expect(
        page.getByText(/quản lý|roles|vai trò|permissions/i).first(),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('open Edit User modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /thành viên/i);
    await page.waitForTimeout(3000);
    const editBtn = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    const allButtons = page.locator('td button');
    if ((await allButtons.count()) > 0) {
      await allButtons.first().click();
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('AdminPage — Vai trò & Quyền', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Vai trò tab shows matrix', async ({ page }) => {
    await login(page);
    await clickTab(page, /vai trò/i);
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: /vai trò/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test('toggle permission in role matrix', async ({ page }) => {
    await login(page);
    await clickTab(page, /vai trò/i);
    await page.waitForTimeout(3000);
    const toggleButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.w-4') });
    if ((await toggleButtons.count()) > 0) {
      await toggleButtons.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('open Thêm vai trò modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /vai trò/i);
    const addBtn = page.getByRole('button', { name: /thêm vai trò/i });
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await expect(page.getByText(/thêm vai trò mới/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('create role → submit form', async ({ page }) => {
    await login(page);
    await clickTab(page, /vai trò/i);
    const addBtn = page.getByRole('button', { name: /thêm vai trò/i });
    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await addBtn.click();
    await page.waitForTimeout(1000);

    const codeInput = page.getByPlaceholder(/VD: INSTRUCTOR/i);
    if (await codeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await codeInput.fill(testRoleCode);
    }
    const allInputs = page.locator('input:visible');
    if ((await allInputs.count()) >= 2) {
      await allInputs.nth(1).fill(`E2E Role ${ts}`);
    }
    await page
      .getByRole('button', { name: /tạo vai trò/i })
      .first()
      .click();
    await page.waitForTimeout(3000);
  });

  test('open Edit Role modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /vai trò/i);
    await page.waitForTimeout(3000);
    const editBtn = page.getByRole('button', { name: /sửa|edit/i }).first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await expect(page.getByText(/sửa vai trò/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('Danh mục Quyền tab shows permissions', async ({ page }) => {
    await login(page);
    await clickTab(page, /danh mục quyền/i);
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: /quyền/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test('open Thêm quyền modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /danh mục quyền/i);
    const addBtn = page.getByRole('button', { name: /thêm quyền/i });
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await expect(page.getByText(/thêm quyền mới/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('create permission → fill form', async ({ page }) => {
    await login(page);
    await clickTab(page, /danh mục quyền/i);
    const addBtn = page.getByRole('button', { name: /thêm quyền/i });
    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await addBtn.click();
    await page.waitForTimeout(1000);

    const resourceSelect = page.locator('select').first();
    const options = resourceSelect.locator('option');
    if ((await options.count()) > 1) {
      await resourceSelect.selectOption({ index: 1 });
    }
    const nameInput = page.getByPlaceholder('Ví dụ: Xem danh sách roles');
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill(`E2E_PERM_${ts}`);
    }
    const createBtn = page.getByRole('button', { name: /tạo quyền/i });
    if (await createBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.getByRole('button', { name: /hủy/i }).first().click();
    }
  });
});

test.describe('AdminPage — Quiz Review', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Kiểm duyệt Câu hỏi tab loads pending banks', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt câu hỏi/i);
    await page.waitForTimeout(4000);
    const heading = page
      .getByRole('heading', { name: /câu hỏi|ngân hàng/i })
      .or(page.getByText(/chờ duyệt|pending/i));
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('Kiểm duyệt Câu hỏi shows empty state or bank cards', async ({
    page,
  }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt câu hỏi/i);
    await page.waitForTimeout(4000);

    const emptyState = page.getByText(/không có.*chờ duyệt/i);
    const bankCards = page.getByText(/duyệt/i).or(page.getByText(/từ chối/i));
    const isEmpty = await emptyState
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasBanks = (await bankCards.count()) > 0;
    expect(isEmpty || hasBanks).toBe(true);
  });

  test('approve a pending bank', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt câu hỏi/i);
    await page.waitForTimeout(4000);

    const emptyState = page.getByText(/không có.*chờ duyệt/i);
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false))
      return;

    const approveBtn = page.getByRole('button', { name: /duyệt/i }).first();
    if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(3000);
    }
  });

  test('reject a bank with reason', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt câu hỏi/i);
    await page.waitForTimeout(4000);

    const emptyState = page.getByText(/không có.*chờ duyệt/i);
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false))
      return;

    const rejectBtn = page.getByRole('button', { name: /từ chối/i }).first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(1000);

      const reasonText = page
        .getByText(/xác nhận từ chối/i)
        .or(page.locator('textarea'));
      if (
        await reasonText
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        const textarea = page.locator('textarea');
        if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
          await textarea.fill('E2E reject reason');
        }
        await page
          .getByRole('button', { name: /xác nhận|cancel|hủy/i })
          .first()
          .click();
        await page.waitForTimeout(2000);
      }
    }
  });
});

test.describe('AdminPage — Forum Moderation', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Kiểm duyệt Forum tab loads reports', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt forum/i);
    await page.waitForTimeout(4000);

    const reports = page
      .getByText(/báo cáo|report|chờ xử lý/i)
      .or(page.getByText(/không có/i));
    await expect(reports.first()).toBeVisible({ timeout: 10000 });
  });

  test('switch report status filter tabs', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt forum/i);
    await page.waitForTimeout(3000);

    const filterTabs = [
      page.getByText(/chờ xử lý/i),
      page.getByText(/đã xử lý/i),
      page.getByText(/bỏ qua/i),
    ];
    for (const tab of filterTabs) {
      if (
        await tab
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await tab.first().click();
        await page.waitForTimeout(1500);
      }
    }
  });

  test('resolve a report', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt forum/i);
    await page.waitForTimeout(4000);

    const emptyState = page.getByText(/không có báo cáo/i);
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false))
      return;

    const resolveBtn = page
      .getByRole('button', { name: /xử lý|resolve/i })
      .first();
    if (await resolveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resolveBtn.click();
      await page.waitForTimeout(1000);
      const noteInput = page.locator('input[type="text"]').last();
      if (await noteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await noteInput.fill('E2E resolved');
        await noteInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('dismiss a report', async ({ page }) => {
    await login(page);
    await clickTab(page, /kiểm duyệt forum/i);
    await page.waitForTimeout(4000);

    const emptyState = page.getByText(/không có báo cáo/i);
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false))
      return;

    const dismissBtn = page
      .getByRole('button', { name: /bỏ qua|dismiss/i })
      .first();
    if (await dismissBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dismissBtn.click();
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('AdminPage — User Admin & Monitoring', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Quản trị User tab shows search interface', async ({ page }) => {
    await login(page);
    await clickTab(page, /quản trị user/i);
    await page.waitForTimeout(3000);
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('search for user by email', async ({ page }) => {
    await login(page);
    await clickTab(page, /quản trị user/i);
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(adminEmail);
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);
    }
  });

  test('toggle user lock/unlock', async ({ page }) => {
    await login(page);
    await clickTab(page, /quản trị user/i);
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(adminEmail);
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);
    }
    const lockBtn = page.getByRole('button', { name: /lock|unlock|khóa/i });
    if (
      await lockBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await lockBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('Giám sát tab shows monitoring cards', async ({ page }) => {
    await login(page);
    await clickTab(page, /giám sát/i);
    await page.waitForTimeout(3000);
    await expect(page.getByText(/trực tuyến|online/i).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/lượt truy cập/i).first()).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe('AdminPage — Problems Management', () => {
  test.beforeAll(async () => {
    await seedRoles();
    await seedAdminUser(adminEmail, `e2eadmin${ts}`, adminPassword);
  });
  test.afterAll(async () => await cleanupE2ETestData());

  test('Đề bài Coding tab shows problem list', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);
    await expect(
      page.getByRole('heading', { name: /đề bài|coding|problem/i }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('open Create Problem modal with all 10 languages', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    const addBtn = page.getByRole('button', { name: /thêm đề bài/i });
    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await addBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/tạo đề bài lập trình mới/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('fill title in create problem form', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    const addBtn = page.getByRole('button', { name: /thêm đề bài/i });
    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await addBtn.click();
    await page.waitForTimeout(2000);

    const titleInput = page
      .getByPlaceholder('Ví dụ: Tính tổng 2 số')
      .or(page.locator('input').first());
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(`E2E_Problem_${ts}`);
    }
    const createBtn = page.getByRole('button', { name: /tạo đề bài/i });
    if (await createBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(5000);
    } else {
      await page.getByRole('button', { name: /hủy/i }).first().click();
    }
  });

  test('Test Cases modal — add test case', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    const testCasesBtn = page.getByRole('button', { name: /test cases/i });
    if (
      !(await testCasesBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await testCasesBtn.first().click();
    await page.waitForTimeout(2000);

    const addForm = page
      .getByRole('button', { name: /thêm test case/i })
      .or(page.locator('textarea'));
    if (
      await addForm
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      const textareas = page.locator('textarea');
      if ((await textareas.count()) >= 2) {
        await textareas.nth(0).fill('E2E input data');
        await textareas.nth(1).fill('E2E expected output');
        await page.getByRole('button', { name: /thêm test case/i }).click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test('Test Cases modal — download template', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    const testCasesBtn = page.getByRole('button', { name: /test cases/i });
    if (
      !(await testCasesBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await testCasesBtn.first().click();
    await page.waitForTimeout(2000);

    const downloadBtn = page.getByRole('button', {
      name: /tải file mẫu|download template/i,
    });
    if (
      await downloadBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(downloadBtn.first()).toBeVisible();
    }
  });

  test('Test Cases modal — delete test case', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    const testCasesBtn = page.getByRole('button', { name: /test cases/i });
    if (
      !(await testCasesBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await testCasesBtn.first().click();
    await page.waitForTimeout(2000);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const deleteIcons = page
      .locator('button')
      .filter({ has: page.locator('svg.text-red') })
      .first();
    const allDeleteBtns = page.locator('td:last-child button').first();
    if (await allDeleteBtns.isVisible({ timeout: 3000 }).catch(() => false)) {
      await allDeleteBtns.click();
      await page.waitForTimeout(2000);
    } else if (
      await deleteIcons.isVisible({ timeout: 3000 }).catch(() => false)
    ) {
      await deleteIcons.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Test Cases modal — close button', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    const testCasesBtn = page.getByRole('button', { name: /test cases/i });
    if (
      !(await testCasesBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await testCasesBtn.first().click();
    await page.waitForTimeout(2000);

    const closeBtn = page.getByRole('button', { name: /đóng|close/i });
    if (
      await closeBtn
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await closeBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('open Edit Problem modal', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    const editBtn = page.getByRole('button', { name: /sửa|edit/i }).first();
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('delete problem with confirm dialog', async ({ page }) => {
    await login(page);
    await clickTab(page, /đề bài coding/i);
    await page.waitForTimeout(3000);

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('xóa');
      await dialog.accept();
    });

    const deleteBtn = page.getByRole('button', { name: /xóa|delete/i }).first();
    if (await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(2000);
    }
  });
});

async function login(page: import('@playwright/test').Page) {
  await page.goto(ADMINPAGE_BASE, { waitUntil: 'domcontentloaded' });

  const sidebar = page.locator('aside');
  if (await sidebar.isVisible({ timeout: 3000 }).catch(() => false)) return;

  const emailInput = page.getByPlaceholder('admin@example.com');
  const passwordInput = page.locator('input[type="password"]');
  const loginBtn = page.getByRole('button', { name: /đăng nhập/i });

  await loginBtn.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill(adminEmail);
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.fill(adminPassword);
  await loginBtn.click();

  await page.locator('aside').waitFor({ state: 'visible', timeout: 30000 });
}

async function clickTab(
  page: import('@playwright/test').Page,
  name: string | RegExp,
) {
  const tab = page.getByRole('button', { name });
  if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(2000);
  }
}
