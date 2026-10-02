import {
  ChartColumn,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Map as MapIcon,
  MessagesSquare,
  PackageCheck,
  Route,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'Operations',
      items: [
        { title: 'Overview', url: '/', icon: LayoutDashboard },
        { title: 'Live map', url: '/live-map', icon: MapIcon },
        { title: 'Deliveries', url: '/deliveries', icon: PackageCheck },
        { title: 'Routes', url: '/routes', icon: Route },
        { title: 'Messages', url: '/messages', icon: MessagesSquare },
      ],
    },
    {
      title: 'Fleet',
      items: [
        { title: 'Drivers', url: '/drivers', icon: Users },
        { title: 'Vehicles', url: '/vehicles', icon: Truck },
        {
          title: 'Vehicle checks',
          url: '/vehicle-checks',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: 'Insights',
      items: [
        { title: 'Alerts', url: '/alerts', icon: TriangleAlert },
        { title: 'Reports', url: '/reports', icon: ChartColumn },
      ],
    },
    {
      title: 'Admin & access',
      items: [
        { title: 'Admins', url: '/admins', icon: ShieldCheck },
        { title: 'Activity log', url: '/activity-log', icon: History },
      ],
    },
  ],
}
