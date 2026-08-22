import { siteConfig } from '@/lib/config'

/**
 * 驱动版权
 * @returns
 */
export default function PoweredBy(props) {
  const showPowerBy = siteConfig('FOOTER_POWER_BY', true)
  if (!showPowerBy) {
    return null
  }
  const powerByText = siteConfig('FOOTER_POWER_BY_TEXT') || `NotionNext ${siteConfig('VERSION')}`
  const powerByUrl = siteConfig('FOOTER_POWER_BY_URL') || 'https://github.com/notionnext-org/NotionNext'

  return (
    <div className={`inline text-sm font-serif ${props.className || ''}`}>
      <span className='mr-1'>Powered by</span>
      <a
        href={powerByUrl}
        target='_blank'
        rel='noreferrer'
        className='underline justify-start'>
        {powerByText}
      </a>
      .
    </div>
  )
}
