const { gql } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');


// TYPE DEFINITIONS

const typeDefs = gql`
  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
  }

  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    startDate: String!
    endDate: String!
    owner: User!
    members: [User!]
    tasks: [Task!]
  }

  type Task {
    id: ID!
    title: String!
    projectId: Project!
    assignedTo: User
    status: TaskStatus!
    priority: TaskPriority!
    dueDate: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User

    projects: [Project!]
    project(id: ID!): Project

    tasks(projectId: ID!): [Task!]
    task(id: ID!): Task
  }

  type Mutation {
    # Authentication
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Project
    createProject(name: String!, description: String, startDate: String!, endDate: String!): Project!
    addMemberToProject(projectId: ID!, userId: ID!): Project!

    # Task
    createTask(title: String!, projectId: ID!, assignedTo: ID, priority: TaskPriority, dueDate: String): Task!
    updateTaskStatus(id: ID!, status: TaskStatus!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

// RESOLVERS

const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      return user;
    },

    projects: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await Project.find({ $or: [{ owner: user.id }, { members: user.id }] })
        .populate("owner")
        .populate("members");
    },

    project: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(id)
        .populate("owner")
        .populate("members");

      if (!project) throw new Error("Project not found");

      return project;
    },

    tasks: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      return await Task.find({ projectId })
        .populate("projectId")
        .populate("assignedTo");
    },

    task: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await Task.findById(id)
        .populate("projectId")
        .populate("assignedTo");
    },
  },

  Project: {
    tasks: async (parent) => {
      return await Task.find({ projectId: parent.id }).populate("assignedTo");
    }
  },

  Mutation: {
    
    // AUTH
  
    register: async (_, { username, email, password }) => {
      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashed
      });

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Incorrect password");

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return { token, user };
    },

  
    // PROJECT
   
    createProject: async (_, { name, description, startDate, endDate }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.create({
        name,
        description,
        startDate,
        endDate,
        owner: user.id,
        members: []
      });

      return project.populate("owner");
    },

    addMemberToProject: async (_, { projectId, userId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      if (project.owner.toString() !== user.id)
        throw new Error("Only owner can add members");

      if (!project.members.includes(userId)) {
        project.members.push(userId);
      }

      await project.save();

      return project.populate("owner").populate("members");
    },

 
    // TASKS
  
    createTask: async (_, { title, projectId, assignedTo, priority, dueDate }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = await Task.create({
        title,
        projectId,
        assignedTo,
        priority,
        dueDate
      });

      return task.populate("projectId").populate("assignedTo");
    },

    updateTaskStatus: async (_, { id, status }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = await Task.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )
        .populate("projectId")
        .populate("assignedTo");

      return task;
    },

    deleteTask: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const deleted = await Task.findByIdAndDelete(id);
      return Boolean(deleted);
    }
  }
};

module.exports = { typeDefs, resolvers };
