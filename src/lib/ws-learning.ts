/**
 * 学習コース管理 — localStorage管理
 * C-XII-1/2: コース作成・受講記録
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface Slide {
  id: string;
  content: string; // Markdown
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  slides: Slide[];
  quiz: QuizQuestion[];
  createdAt: string;
}

export interface CourseProgress {
  courseId: string;
  memberId: string;
  memberName: string;
  completedSlides: number;
  quizScore: number | null; // null = not taken
  completedAt: string | null;
  lastAccessedAt: string;
}

const COURSES_KEY = "lp_ws_courses";
const PROGRESS_KEY = "lp_ws_course_progress";

export const COURSE_CATEGORIES = [
  "法務基礎",
  "コンプライアンス",
  "契約実務",
  "労務管理",
  "情報セキュリティ",
  "その他",
];

function loadCourses(): Course[] {
  return wsLoad<Course[]>(COURSES_KEY, []);
}
function saveCourses(courses: Course[]) {
  wsSave(COURSES_KEY, courses);
}
function loadProgress(): CourseProgress[] {
  return wsLoad<CourseProgress[]>(PROGRESS_KEY, []);
}
function saveProgress(progress: CourseProgress[]) {
  wsSave(PROGRESS_KEY, progress);
}

export function getAllCourses(): Course[] {
  return loadCourses().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCourse(id: string): Course | undefined {
  return loadCourses().find((c) => c.id === id);
}

export function addCourse(data: { title: string; description: string; category: string }): Course {
  const courses = loadCourses();
  const course: Course = {
    ...data,
    id: uuid(),
    slides: [],
    quiz: [],
    createdAt: new Date().toISOString(),
  };
  courses.push(course);
  saveCourses(courses);
  return course;
}

export function updateCourse(id: string, updates: Partial<Course>) {
  const courses = loadCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx >= 0) {
    courses[idx] = { ...courses[idx], ...updates };
    saveCourses(courses);
  }
}

export function deleteCourse(id: string) {
  saveCourses(loadCourses().filter((c) => c.id !== id));
  saveProgress(loadProgress().filter((p) => p.courseId !== id));
}

export function addSlide(courseId: string, content: string): Slide {
  const courses = loadCourses();
  const course = courses.find((c) => c.id === courseId);
  if (!course) throw new Error("Course not found");
  const slide: Slide = { id: uuid(), content };
  course.slides.push(slide);
  saveCourses(courses);
  return slide;
}

export function addQuizQuestion(courseId: string, q: Omit<QuizQuestion, "id">): QuizQuestion {
  const courses = loadCourses();
  const course = courses.find((c) => c.id === courseId);
  if (!course) throw new Error("Course not found");
  const question: QuizQuestion = { ...q, id: uuid() };
  course.quiz.push(question);
  saveCourses(courses);
  return question;
}

export function getAllProgress(): CourseProgress[] {
  return loadProgress();
}

export function getProgressForCourse(courseId: string): CourseProgress[] {
  return loadProgress().filter((p) => p.courseId === courseId);
}

export function upsertProgress(
  courseId: string,
  memberId: string,
  memberName: string,
  updates: Partial<CourseProgress>,
) {
  const progress = loadProgress();
  const idx = progress.findIndex((p) => p.courseId === courseId && p.memberId === memberId);
  if (idx >= 0) {
    progress[idx] = { ...progress[idx], ...updates, lastAccessedAt: new Date().toISOString() };
  } else {
    progress.push({
      courseId,
      memberId,
      memberName,
      completedSlides: 0,
      quizScore: null,
      completedAt: null,
      lastAccessedAt: new Date().toISOString(),
      ...updates,
    });
  }
  saveProgress(progress);
}
