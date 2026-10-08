import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { adminsQueryOptions } from '@/api/admins'
import { depotsQueryOptions } from '@/api/depots'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { AdminsDialogs } from './components/admins-dialogs'
import { AdminsPrimaryButtons } from './components/admins-primary-buttons'
import { AdminsProvider } from './components/admins-provider'
import { AdminsTable } from './components/admins-table'

const route = getRouteApi('/_authenticated/admins/')

export function Admins() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data = [], isLoading } = useQuery(adminsQueryOptions())
  const { data: depots = [] } = useQuery(depotsQueryOptions())

  return (
    <AdminsProvider>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Admins'
        >
          <AdminsPrimaryButtons />
        </PageTitle>
        <AdminsTable
          data={data}
          depots={depots}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
      <AdminsDialogs />
    </AdminsProvider>
  )
}
