import { describe, it, expect } from 'vitest'
import { mockJobs, mockJobDetail, mockCategories, mockTechnologies } from '../data/jobFixtures.js'

describe('Job list item shape', () => {
  const jobShape = {
    id: expect.any(Number),
    title: expect.any(String),
    slug: expect.any(String),
    description: expect.any(String),
    salary_min: expect.any(Number),
    salary_max: expect.any(Number),
    salary_currency: expect.any(String),
    location: expect.any(String),
    work_type: expect.any(String),
    experience_level: expect.any(String),
    created_at: expect.any(String),
    employer: {
      company_name: expect.any(String),
      logo_url: null,
      location: expect.any(String),
    },
    category: {
      id: expect.any(Number),
      name: expect.any(String),
    },
    technologies: expect.arrayContaining([
      expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
    ]),
  }

  it.each(mockJobs)('job "$title" matches list item shape', (job) => {
    expect(job).toMatchObject(jobShape)
  })
})

describe('Job detail shape', () => {
  it('includes extended fields beyond list item', () => {
    expect(mockJobDetail).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      responsibilities: expect.any(String),
      requirements: expect.any(String),
      benefits: expect.any(String),
      application_deadline: expect.any(String),
      comments_count: expect.any(Number),
      employer: {
        company_name: expect.any(String),
        logo_url: null,
        location: expect.any(String),
        company_description: expect.any(String),
        website: expect.any(String),
      },
    })
  })
})

describe('Pagination meta shape', () => {
  it('contains required pagination fields', () => {
    const meta = { current_page: 1, last_page: 1, per_page: 20, total: 3 }
    expect(meta).toEqual({
      current_page: expect.any(Number),
      last_page: expect.any(Number),
      per_page: expect.any(Number),
      total: expect.any(Number),
    })
  })
})

describe('Category shape', () => {
  it.each(mockCategories)('category "$name" matches shape', (cat) => {
    expect(cat).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      slug: expect.any(String),
      jobs_count: expect.any(Number),
    })
  })
})

describe('Technology shape', () => {
  it.each(mockTechnologies)('technology "$name" matches shape', (tech) => {
    expect(tech).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      slug: expect.any(String),
    })
  })
})
