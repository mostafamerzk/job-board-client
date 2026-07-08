import { useSearchParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { JobModeration } from '../components/JobModeration.jsx'
import { UserManagement } from '../components/UserManagement.jsx'
import { CommentModeration } from '../components/CommentModeration.jsx'

const VALID_TABS = ['jobs', 'users', 'comments']
const DEFAULT_TAB = 'jobs'

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeKey = VALID_TABS.includes(rawTab) ? rawTab : DEFAULT_TAB

  function handleSelect(tab) {
    setSearchParams({ tab })
  }

  return (
    <Container className="py-4">
      <Tabs activeKey={activeKey} onSelect={handleSelect} className="mb-4">
        <Tab eventKey="jobs" title="Jobs">
          <JobModeration />
        </Tab>
        <Tab eventKey="users" title="Users">
          <UserManagement />
        </Tab>
        <Tab eventKey="comments" title="Comments">
          <CommentModeration />
        </Tab>
      </Tabs>
    </Container>
  )
}
