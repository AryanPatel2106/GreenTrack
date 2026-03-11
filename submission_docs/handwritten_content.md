# Content for Handwritten Sections

**Instructions:**
Use the text below as the source material for your handwritten pages. You can copy this word-for-word or summarize it as needed. Once handwritten, scan the pages or paste photographs of them into the text boxes in your final report.

---

## 1. Abstract of the Project

**GreenTrack** is a web-based social gamification platform designed to promote environmental sustainability through community-driven tree planting. In an era of increasing climate change awareness, GreenTrack bridges the gap between individual action and collective impact by digitizing the tree-planting experience. The application allows users to register planted trees, track their growth, and share updates with a global community of "Earth Guardians."

The system leverages a robust **React.js** frontend for a dynamic, responsive user interface and a **Node.js/Express** backend to handle complex logic. Data integrity is ensured through a **MySQL** relational database, while **Firebase Authentication** provides secure user management. Key features include a real-time social feed, interactive leaderboards, and a verified "Tree ID" system that ensures every registered tree is unique and traceable to its caretaker. By combining social networking elements with environmental accountability, GreenTrack incentivizes users to contribute actively to reforestation efforts.

---

## 2. Modules of the Project

The GreenTrack system is divided into four core modules, each handling a specific aspect of the application's functionality:

### A. User Management & Authentication Module
This module handles secure user access and profile management. It integrates **Firebase Auth** for handling secure logins (Google OAuth) and token verification. On the backend, it synchronizes user data with the MySQL database, ensuring that every user has a comprehensive profile storing their level, experience points (XP), and badges. It also enforces **global username uniqueness** to maintain a consistent identity across the platform.

### B. Tree Inventory & Tracking Module
The core of the application, this module allows users to digitally register real-world trees. Users input details such as species, planting date, and location. The system generates and enforces a **unique Tree ID (Tag)** for each entry, preventing duplicate registrations. This module also tracks the "health score" of trees and logs growth updates over time, functioning as a digital ledger for the user's forest.

### C. Social Feed & Interaction Module
To foster community engagement, this module allows users to post updates about their trees, including photos and captions. It supports social interactions such as **likes (upvotes)** and **comments**, enabling users to encourage one another. The feed algorithm sorts posts to highlight recent activity, creating a vibrant, real-time stream of environmental impact. A "Verify" status ensures that posted content is legitimate.

### D. Gamification & Leaderboard Module
This module incentivizes participation by awarding points for actions such as planting trees, verifying posts, and receiving likes. It calculates global rankings for individual users and community teams. The Leaderboard dynamically updates to show the top "Planters" and "Star Teams," creating a healthy competitive environment that drives user retention and continued planting activity.

---

## 3. Design of Database

The database for GreenTrack is designed using the **Relational Model** (RDBMS) to ensure data consistency, integrity, and efficient querying. The schema is normalized to facilitate complex relationships between users, trees, and their social interactions.

### Key Entities and Relationships:

1.  **Users Table**: The central entity. It stores profile information and gamification stats. The `uid` serves as the primary key, linking to all other activities. A unique constraint on the `name` column ensures distinct user identities.

2.  **Trees Table**: Represents the physical assets. Each tree is linked to a `caretaker_id` (Foreign Key referencing Users). A composite unique key `(caretaker_id, tree_tag)` is implemented to ensure that a specific user cannot duplicate a tree ID within their personal inventory, mirroring real-world constraints.

3.  **Posts Table**: Connects the social aspect to the physical data. Each post references both a user (`user_id`) and a specific tree (`tree_id`), creating a verifiable trail of updates. This "Many-to-One" relationship allows multiple posts (history) for a single tree.

4.  **Communities & Comments**: Supporting tables for group activities and nested interactions. Comments are linked via foreign keys to the parent Post, with `ON DELETE CASCADE` enabled to maintain referential integrity—if a post is deleted, its comments are automatically removed.

The design prioritizes **Data Integrity** (via Foreign Keys and Unique Constraints) and **Performance** (via indexing on frequently queried columns like `caretaker_id` and `tree_tag`).
