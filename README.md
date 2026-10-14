LeetMetric is a web-based analytics dashboard designed for tracking LeetCode performance. By simply entering a LeetCode username, users can instantly visualize their coding progress and problem-solving metrics.
The platform retrieves real-time user data directly from the LeetCode GraphQL API, transforming raw data into an intuitive, visually engaging dashboard.

🚀 Key Features

Search LeetCode user by username
Validate username input
Fetch LeetCode user statistics
Display total solved problems
Display Easy, Medium and Hard problem progress
Display overall submission statistics
Dynamic progress circles
Dynamic statistics cards
Handle invalid or unavailable usernames
Responsive and simple user interface

🛠️ Technology Stack

• HTML5: Semantic structure and content markup.
• CSS3: Modern styling, layouts, and responsive design.
• JavaScript (Vanilla): Dynamic DOM manipulation and application logic.
• Fetch API: Asynchronous network requests for data gathering.
• LeetCode GraphQL API: The primary data source for user profiles.
• CORS Proxy: Middleware to bypass cross-origin resource sharing restrictions.

📊 Performance Metrics

The dashboard visualizes two primary data sets:
• Solved Milestone Tracking
	• Total Problems Completed
	• Easy Challenges Solved
	• Medium Challenges Solved
	• Hard Challenges Solved
• Submission Activity Log
	• Cumulative Submissions
	• Easy Tier Submissions
	• Medium Tier Submissions
	• Hard Tier Submissions

⚙️ Operational Workflow

1. Provide a valid LeetCode username in the input field.
2. Trigger the search by clicking the query button.
3. JavaScript initiates an asynchronous request to the GraphQL API.
4. The application parses and processes the incoming API response payload.
5. The UI updates dynamically to present the user's latest statistics.
6. Circular progress indicators render to reflect completion ratios by difficulty.

📁 Repository Architecture

text
LeetMetric/
│
├── index.html
├── style.css
├── script.js
└── README.md
