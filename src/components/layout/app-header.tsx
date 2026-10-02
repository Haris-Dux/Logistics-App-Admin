import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Header } from './header'

export function AppHeader({ fixed }: { fixed?: boolean }) {
  return (
    <Header fixed={fixed}>
      <Search className='me-auto' />
      <ThemeSwitch />
      <ConfigDrawer />
    </Header>
  )
}
