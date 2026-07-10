# Hospital Management System
# System Design Document

---

# 1. High Level Architecture

                          Users

        +-----------------------------------------+
        |                                         |
        | Angular Admin Portal                    |
        | React Native Patient App                |
        +------------------+----------------------+
                           |
                    HTTPS (443)
                           |
                           |
                bootstraphms.duckdns.org
                           |
                     NGINX Reverse Proxy
                           |
          +----------------+----------------+
          |                                 |
          |                                 |
     Angular Static Files             REST APIs
                                           |
                                    Node.js Express
                                           |
                            Authentication Middleware
                                           |
                               Role Based Access Control
                                           |
                                    Controllers
                                           |
                                     Service Layer
                                           |
                                        Mongoose
                                           |
                                     MongoDB Atlas
