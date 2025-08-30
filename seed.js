const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/cloudblitz-dashboard?retryWrites=true&w=majority';

// Job Schema (same as in server.js)
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    jobType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract']
    },
    experience: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    salary: {
        type: String,
        trim: true,
        maxlength: 50
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    fullDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    applyLink: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Apply link must be a valid URL starting with http:// or https://'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

// Sample job data
const sampleJobs = [
    {
        title: "Senior Full Stack Developer",
        company: "CloudBlitz Technologies",
        location: "Mumbai, India",
        jobType: "Full-time",
        experience: "5-8 years",
        salary: "₹15,00,000 - ₹25,00,000",
        shortDescription: "Join our dynamic team to build scalable web applications using modern technologies like React, Node.js, and cloud platforms.",
        fullDescription: `We are looking for a Senior Full Stack Developer to join our growing team at CloudBlitz Technologies.

Key Responsibilities:
• Design and develop scalable web applications
• Work with React, Node.js, and cloud platforms (AWS/Azure)
• Collaborate with cross-functional teams
• Mentor junior developers
• Participate in code reviews and technical discussions

Requirements:
• 5-8 years of experience in full-stack development
• Strong proficiency in JavaScript, React, Node.js
• Experience with cloud platforms (AWS/Azure/GCP)
• Knowledge of databases (MongoDB, PostgreSQL)
• Experience with CI/CD pipelines
• Strong problem-solving skills

Benefits:
• Competitive salary and benefits
• Flexible work arrangements
• Professional development opportunities
• Health insurance
• Annual bonus`,
        applyLink: "https://cloudblitz.in/careers/senior-developer"
    },
    {
        title: "DevOps Engineer",
        company: "TechCorp Solutions",
        location: "Bangalore, India",
        jobType: "Full-time",
        experience: "3-6 years",
        salary: "₹12,00,000 - ₹20,00,000",
        shortDescription: "Help us build and maintain robust infrastructure and deployment pipelines for our cloud-native applications.",
        fullDescription: `We are seeking a DevOps Engineer to join our infrastructure team.

Key Responsibilities:
• Design and implement CI/CD pipelines
• Manage cloud infrastructure (AWS/Azure)
• Monitor and optimize system performance
• Implement security best practices
• Automate deployment processes

Requirements:
• 3-6 years of DevOps experience
• Strong knowledge of AWS/Azure services
• Experience with Docker, Kubernetes
• Proficiency in scripting (Python, Bash)
• Knowledge of monitoring tools (Prometheus, Grafana)
• Experience with Terraform or CloudFormation

Benefits:
• Competitive compensation
• Remote work options
• Learning and certification support
• Health and wellness benefits`,
        applyLink: "https://techcorp.com/careers/devops-engineer"
    },
    {
        title: "UI/UX Designer",
        company: "DesignStudio Pro",
        location: "Delhi, India",
        jobType: "Contract",
        experience: "2-4 years",
        salary: "₹8,00,000 - ₹15,00,000",
        shortDescription: "Create beautiful and intuitive user experiences for web and mobile applications.",
        fullDescription: `We are looking for a talented UI/UX Designer to join our creative team.

Key Responsibilities:
• Design user interfaces for web and mobile applications
• Create wireframes, prototypes, and mockups
• Conduct user research and usability testing
• Collaborate with developers and product managers
• Maintain design systems and style guides

Requirements:
• 2-4 years of UI/UX design experience
• Proficiency in Figma, Sketch, or Adobe XD
• Strong portfolio showcasing web and mobile designs
• Understanding of user-centered design principles
• Experience with design systems
• Knowledge of HTML/CSS is a plus

Benefits:
• Creative and collaborative environment
• Flexible working hours
• Professional development opportunities
• Competitive project-based compensation`,
        applyLink: "https://designstudio.com/careers/uiux-designer"
    },
    {
        title: "Data Scientist",
        company: "Analytics Inc",
        location: "Hyderabad, India",
        jobType: "Full-time",
        experience: "4-7 years",
        salary: "₹18,00,000 - ₹30,00,000",
        shortDescription: "Transform data into actionable insights and build machine learning models to drive business decisions.",
        fullDescription: `Join our data science team to work on cutting-edge analytics projects.

Key Responsibilities:
• Develop machine learning models and algorithms
• Analyze large datasets to extract insights
• Build predictive models for business applications
• Collaborate with business stakeholders
• Present findings to technical and non-technical audiences

Requirements:
• 4-7 years of experience in data science
• Strong programming skills in Python/R
• Experience with machine learning frameworks (TensorFlow, PyTorch)
• Knowledge of SQL and big data technologies
• Experience with statistical analysis and modeling
• Strong communication and presentation skills

Benefits:
• Competitive salary with performance bonuses
• Access to latest tools and technologies
• Conference and training opportunities
• Health insurance and wellness programs`,
        applyLink: "https://analyticsinc.com/careers/data-scientist"
    },
    {
        title: "Product Manager",
        company: "InnovateTech",
        location: "Pune, India",
        jobType: "Full-time",
        experience: "6-10 years",
        salary: "₹25,00,000 - ₹40,00,000",
        shortDescription: "Lead product strategy and development for our SaaS platform, driving innovation and user growth.",
        fullDescription: `We are seeking an experienced Product Manager to lead our product development initiatives.

Key Responsibilities:
• Define product vision and strategy
• Lead cross-functional product development teams
• Conduct market research and competitive analysis
• Define product requirements and user stories
• Work closely with engineering, design, and marketing teams
• Analyze product metrics and user feedback

Requirements:
• 6-10 years of product management experience
• Experience in SaaS or B2B products
• Strong analytical and strategic thinking skills
• Excellent communication and leadership abilities
• Experience with agile development methodologies
• Technical background is a plus

Benefits:
• Competitive salary with equity options
• Leadership development opportunities
• Flexible work arrangements
• Comprehensive benefits package`,
        applyLink: "https://innovatetech.com/careers/product-manager"
    },
    {
        title: "Frontend Developer",
        company: "WebCraft Solutions",
        location: "Chennai, India",
        jobType: "Part-time",
        experience: "2-4 years",
        salary: "₹6,00,000 - ₹10,00,000",
        shortDescription: "Build responsive and interactive user interfaces using modern frontend technologies.",
        fullDescription: `Join our frontend development team to create amazing user experiences.

Key Responsibilities:
• Develop responsive web applications using React/Vue.js
• Implement modern UI/UX designs
• Optimize application performance
• Collaborate with backend developers
• Write clean, maintainable code

Requirements:
• 2-4 years of frontend development experience
• Strong proficiency in JavaScript, HTML, CSS
• Experience with React, Vue.js, or Angular
• Knowledge of responsive design principles
• Understanding of web accessibility standards
• Experience with version control (Git)

Benefits:
• Flexible part-time schedule
• Remote work options
• Skill development opportunities
• Competitive hourly rates`,
        applyLink: "https://webcraft.com/careers/frontend-developer"
    },
    {
        title: "Backend Developer",
        company: "ServerLogic",
        location: "Gurgaon, India",
        jobType: "Full-time",
        experience: "3-5 years",
        salary: "₹12,00,000 - ₹18,00,000",
        shortDescription: "Design and develop robust backend services and APIs for our enterprise applications.",
        fullDescription: `We are looking for a Backend Developer to join our engineering team.

Key Responsibilities:
• Design and develop RESTful APIs
• Build scalable backend services
• Work with databases and data modeling
• Implement security and authentication
• Optimize application performance
• Write unit tests and documentation

Requirements:
• 3-5 years of backend development experience
• Strong proficiency in Node.js, Python, or Java
• Experience with databases (MongoDB, PostgreSQL)
• Knowledge of API design principles
• Understanding of microservices architecture
• Experience with cloud platforms

Benefits:
• Competitive salary and benefits
• Professional development opportunities
• Modern tech stack and tools
• Collaborative work environment`,
        applyLink: "https://serverlogic.com/careers/backend-developer"
    },
    {
        title: "QA Engineer",
        company: "QualityFirst",
        location: "Noida, India",
        jobType: "Contract",
        experience: "2-4 years",
        salary: "₹8,00,000 - ₹12,00,000",
        shortDescription: "Ensure software quality through comprehensive testing strategies and automated test frameworks.",
        fullDescription: `Join our quality assurance team to ensure the highest standards of software quality.

Key Responsibilities:
• Design and execute test plans and test cases
• Develop automated test scripts
• Perform manual and automated testing
• Report and track software defects
• Collaborate with development teams
• Implement testing best practices

Requirements:
• 2-4 years of QA experience
• Knowledge of testing methodologies and tools
• Experience with Selenium, Cypress, or similar tools
• Understanding of API testing
• Experience with test automation frameworks
• Strong attention to detail

Benefits:
• Project-based compensation
• Flexible working arrangements
• Skill development opportunities
• Exposure to various technologies`,
        applyLink: "https://qualityfirst.com/careers/qa-engineer"
    },
    {
        title: "Cloud Architect",
        company: "CloudScale Solutions",
        location: "Mumbai, India",
        jobType: "Full-time",
        experience: "8-12 years",
        salary: "₹35,00,000 - ₹50,00,000",
        shortDescription: "Design and implement cloud-native architectures for enterprise-scale applications.",
        fullDescription: `We are seeking a Cloud Architect to lead our cloud infrastructure initiatives.

Key Responsibilities:
• Design cloud-native architectures
• Lead cloud migration projects
• Implement security and compliance standards
• Optimize cloud costs and performance
• Mentor technical teams
• Evaluate and recommend cloud technologies

Requirements:
• 8-12 years of experience in cloud architecture
• Deep knowledge of AWS, Azure, or GCP
• Experience with containerization and orchestration
• Strong understanding of security and compliance
• Experience with infrastructure as code
• Excellent communication and leadership skills

Benefits:
• Competitive salary with equity
• Leadership and mentoring opportunities
• Professional certifications support
• Comprehensive benefits package`,
        applyLink: "https://cloudscale.com/careers/cloud-architect"
    },
    {
        title: "Mobile App Developer",
        company: "AppWorks Studio",
        location: "Kolkata, India",
        jobType: "Full-time",
        experience: "3-6 years",
        salary: "₹10,00,000 - ₹18,00,000",
        shortDescription: "Build native and cross-platform mobile applications for iOS and Android platforms.",
        fullDescription: `Join our mobile development team to create innovative mobile applications.

Key Responsibilities:
• Develop native iOS and Android applications
• Work with React Native or Flutter for cross-platform development
• Implement mobile UI/UX designs
• Integrate with backend APIs
• Optimize app performance and user experience
• Publish apps to app stores

Requirements:
• 3-6 years of mobile development experience
• Proficiency in Swift/Objective-C or Kotlin/Java
• Experience with React Native or Flutter
• Knowledge of mobile app architecture patterns
• Understanding of app store guidelines
• Experience with mobile testing frameworks

Benefits:
• Competitive salary and benefits
• Latest mobile development tools
• App store revenue sharing
• Professional development opportunities`,
        applyLink: "https://appworks.com/careers/mobile-developer"
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Connected to MongoDB successfully!');

        // Clear existing jobs
        console.log('🧹 Clearing existing jobs...');
        await Job.deleteMany({});
        console.log('✅ Existing jobs cleared');

        // Insert sample jobs
        console.log('📝 Inserting sample jobs...');
        const insertedJobs = await Job.insertMany(sampleJobs);
        console.log(`✅ Successfully inserted ${insertedJobs.length} sample jobs`);

        // Display sample jobs
        console.log('\n📋 Sample Jobs Created:');
        insertedJobs.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} at ${job.company} (${job.location})`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('🚀 You can now start the application with: npm start');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.log('\n🔧 MongoDB Atlas Connection Troubleshooting:');
            console.log('1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
            console.log('2. Verify username and password in your connection string');
            console.log('3. Ensure your Atlas cluster is active and running');
            console.log('4. Check your connection string format in .env file');
        }
    } finally {
        try {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('Disconnect error:', disconnectError.message);
        }
        process.exit(0);
    }
}

// Run the seed function
seedDatabase(); 