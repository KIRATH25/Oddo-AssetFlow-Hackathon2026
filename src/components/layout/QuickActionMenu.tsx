import React from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, Wrench, Calendar, Box } from 'lucide-react'

export const QuickActionMenu: React.FC = () => {
  const navigate = useNavigate()

  const actions = [
    { label: 'Register Asset', icon: <Box size={16} />, onClick: () => navigate('/assets') },
    { label: 'Book Resource', icon: <Calendar size={16} />, onClick: () => {
      if (window.location.pathname === '/planner') {
        window.dispatchEvent(new CustomEvent('open-create-booking-modal'))
      } else {
        navigate('/planner')
      }
    } },
    { label: 'Raise Maintenance Request', icon: <Wrench size={16} />, onClick: () => navigate('/settings') },
  ]

  return (
    <div className="relative inline-block text-left w-full">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="w-full h-44 px-16 bg-primary text-white hover:bg-primary/95 transition-all rounded-control font-medium flex items-center justify-between shadow-soft select-none cursor-pointer outline-none focus:ring-[2px] focus:ring-primary/20">
              <span className="flex items-center gap-8 text-[14px]">
                <Plus size={18} />
                <span>Quick Action</span>
              </span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </Menu.Button>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-8 w-full origin-top-left bg-card border border-border rounded-card shadow-soft-hover focus:outline-none z-50 overflow-hidden py-8 flex flex-col">
                {actions.map((action, idx) => (
                  <Menu.Item key={idx}>
                    {({ active }) => (
                      <button
                        onClick={action.onClick}
                        className={`flex items-center gap-12 px-16 py-12 text-[13px] font-medium text-left w-full transition-colors select-none outline-none cursor-pointer
                          ${active ? 'bg-primary/8 text-primary' : 'text-text-primary hover:bg-bg/40'}
                        `}
                      >
                        <span className={`${active ? 'text-primary' : 'text-text-secondary'}`}>
                          {action.icon}
                        </span>
                        <span>{action.label}</span>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export default QuickActionMenu
