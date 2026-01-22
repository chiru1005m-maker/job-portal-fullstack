const { test, expect } = require('@playwright/test')

// End-to-end test: register employer and jobseeker, create job via API, apply via UI

test('register employer creates job; jobseeker applies via UI', async ({ page, request }) => {
  const suffix = Date.now()
  const employerEmail = `emp${suffix}@example.com`
  const seekerEmail = `seeker${suffix}@example.com`
  const password = 'secret123'

  // register employer via API
  await request.post('/api/auth/register', { data: { username: employerEmail, email: employerEmail, password, role: 'Employer' } })
  const loginResp = await request.post('/api/auth/login', { data: { username: employerEmail, password } })
  const loginJson = await loginResp.json()
  const empToken = loginJson.token
  expect(empToken).toBeTruthy()

  // create a job using Employer token
  const jobResp = await request.post('/api/jobs', { data: { title: 'Playwright E2E Job', description: 'Job created for E2E test' }, headers: { Authorization: `Bearer ${empToken}` } })
  const jobJson = await jobResp.json()
  expect(jobJson.id).toBeTruthy()
  const jobId = jobJson.id

  // navigate to app and register jobseeker via UI (auto-login occurs)
  await page.goto('/')
  await page.click('text=Register')
  await page.fill('label:has-text("Username") input', seekerEmail)
  await page.fill('label:has-text("Password") input', password)
  await page.click('text=Register')

  // ensure we're logged in by checking header username appears
  await expect(page.locator(`text=${seekerEmail}`)).toBeVisible()

  // go to job details page
  await page.goto(`/jobs/${jobId}`)
  await expect(page.locator('text=Playwright E2E Job')).toBeVisible()

  // click Apply, fill and submit
  await page.click('text=Apply')
  await page.fill('label:has-text("Your email") input', seekerEmail)
  await page.fill('label:has-text("Cover letter") textarea', 'This is a test cover letter with sufficient length to pass validation.')
  await page.click('text=Submit application')

  // expect success message
  await expect(page.locator('text=Application submitted successfully')).toBeVisible()

  // verify via API that employer can see the application for the job
  const appsResp = await request.get(`/api/applications/job/${jobId}`, { headers: { Authorization: `Bearer ${empToken}` } })
  const appsJson = await appsResp.json()
  expect(Array.isArray(appsJson)).toBe(true)
  expect(appsJson.length).toBeGreaterThan(0)
  expect(appsJson[0].applicantEmail).toBe(seekerEmail)
})