import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { MapPin, GraduationCap, Calendar } from 'lucide-react'

export function StudentProfile() {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-6">
        <img 
          src="https://picsum.photos/id/64/120/120" 
          alt="Sarah Johnson"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sarah Johnson</h2>
              <p className="text-gray-600">Engineering Student</p>
            </div>
            <Badge variant="secondary">Verified Student</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <GraduationCap className="w-4 h-4" />
              <span>MIT - Class of 2025</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Boston, MA</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Campaign started Jan 2024</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About Sarah</h3>
            <p className="text-gray-700 leading-relaxed">
              I'm a dedicated engineering student at MIT with a passion for sustainable technology. 
              Coming from a low-income family, I'm working multiple part-time jobs while maintaining 
              a 3.8 GPA. Your support will help me focus on my studies and complete my degree without 
              the burden of excessive student loans.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}