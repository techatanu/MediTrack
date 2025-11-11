import './FeatureCard.css'

const FeatureCard = ({ icon, title, description, iconColor }) => {
  const IconComponent = icon
  
  return (
    <div className="feature-card">
      <div className={`feature-icon ${iconColor}`}>
        <IconComponent />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  )
}

export default FeatureCard

