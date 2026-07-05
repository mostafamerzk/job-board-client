import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { authHandlers } from '../features/auth/data/mockHandlers.js'
import { publicJobsHandlers } from '../features/publicJobs/data/mockHandlers.js'

export const server = setupServer(...authHandlers, ...publicJobsHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
