/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnrollmentUpload from './pages/EnrollmentUpload';
import CoursesQuery from './pages/CoursesQuery';
import GraduationCheck from './pages/GraduationCheck';
import CourseRecommendation from './pages/CourseRecommendation';
import SidebarLayout from './layouts/SidebarLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard SaaS Views wrapped in persistent SidebarLayout */}
        <Route 
          path="/dashboard" 
          element={
            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <SidebarLayout>
              <EnrollmentUpload />
            </SidebarLayout>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <SidebarLayout>
              <CoursesQuery />
            </SidebarLayout>
          } 
        />
        <Route 
          path="/check" 
          element={
            <SidebarLayout>
              <GraduationCheck />
            </SidebarLayout>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <SidebarLayout>
              <CourseRecommendation />
            </SidebarLayout>
          } 
        />

        {/* Fallback Catch and redirect */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}
