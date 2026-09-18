import subscribeToMailchimpApi from '@/lib/plugins/mailchimp'
import { withSecurity } from '@/lib/middleware/withSecurity'

/**
 * 接受邮件订阅
 * @param {*} req
 * @param {*} res
 */
async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, firstName, lastName } = req.body
    try {
      const response = await subscribeToMailchimpApi({ email, first_name: firstName, last_name: lastName })
      await response.json()
      res.status(200).json({ status: 'success', message: 'Subscription successful!' })
    } catch (error) {
      console.error('Subscription error:', error)
      res.status(400).json({ status: 'error', message: 'Subscription failed!' })
    }
  } else {
    res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }
}

export default withSecurity(handler, { rateLimit: { limit: 5, windowMs: 60000 } })
