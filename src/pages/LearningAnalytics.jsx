import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Target,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import {
  collection,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function StatCard({ title, value, note, icon: Icon }) {
  return (
    <div className="bg-white rounded-[28px] px-6 py-5 border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-[14px] text-gray-400 font-medium">{title}</p>
          <h3 className="text-[28px] font-semibold text-gray-950 mt-2">
            {value}
          </h3>
          <p className="text-[12px] text-gray-400 mt-3">{note}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
          <Icon size={21} className="text-[#B72AD7]" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-[30px] p-6 border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
      <h3 className="text-[19px] font-semibold text-gray-950">{title}</h3>
      {subtitle && <p className="text-[14px] text-gray-400 mt-1 mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}

export default function LearningAnalytics() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubQuiz = onSnapshot(collectionGroup(db, "quizAttempts"), (snapshot) => {
      setQuizAttempts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.ref.parent.parent?.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubUsers();
      unsubCourses();
      unsubQuiz();
    };
  }, []);

  const analytics = useMemo(() => {
    const totalAnswers = quizAttempts.length;
    const correctAnswers = quizAttempts.filter((a) => a.isCorrect === true).length;
    const wrongAnswers = totalAnswers - correctAnswers;

    const successRate =
      totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100);

    let completedCourses = 0;
    let progressRecords = 0;

    users.forEach((user) => {
      Object.values(user.courseProgress || {}).forEach((progress) => {
        progressRecords++;
        if (progress.completed === true) completedCourses++;
      });
    });

    const completionRate =
      progressRecords === 0
        ? 0
        : Math.round((completedCourses / progressRecords) * 100);

    const courseRows = courses.map((course) => {
      const courseAttempts = quizAttempts.filter((a) => a.courseId === course.id);
      const courseCorrect = courseAttempts.filter((a) => a.isCorrect === true).length;

      const courseSuccess =
        courseAttempts.length === 0
          ? 0
          : Math.round((courseCorrect / courseAttempts.length) * 100);

      let courseCompleted = 0;
      let courseStarted = 0;

      users.forEach((user) => {
        const progress = user.courseProgress?.[course.id];
        if (progress) {
          courseStarted++;
          if (progress.completed === true) courseCompleted++;
        }
      });

      const courseCompletion =
        courseStarted === 0
          ? 0
          : Math.round((courseCompleted / courseStarted) * 100);

      return {
        id: course.id,
        title: course.title || course.courseTitle || "Untitled Course",
        attempts: courseAttempts.length,
        successRate: courseSuccess,
        started: courseStarted,
        completed: courseCompleted,
        completionRate: courseCompletion,
      };
    });

    const userRows = users.map((user) => {
      const attempts = quizAttempts.filter((a) => a.userId === user.id);
      const correct = attempts.filter((a) => a.isCorrect === true).length;

      const avgScore =
        attempts.length === 0 ? 0 : Math.round((correct / attempts.length) * 100);

      const progress = user.courseProgress || {};
      const completed = Object.values(progress).filter(
        (p) => p.completed === true
      ).length;

      return {
        id: user.id,
        name: user.name || "Unnamed User",
        email: user.email || "No email",
        attempts: attempts.length,
        correct,
        avgScore,
        completedCourses: completed,
      };
    });

    return {
      totalAnswers,
      correctAnswers,
      wrongAnswers,
      successRate,
      completedCourses,
      completionRate,
      courseRows,
      userRows,
    };
  }, [users, courses, quizAttempts]);

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8">
      <div className="space-y-7">
        <div>
          <h1 className="text-[38px] font-semibold text-gray-950 tracking-tight">
            Learning Analytics
          </h1>
          <p className="text-[15px] text-gray-400 mt-2">
            Detailed view of quiz performance, course completion, and learner progress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Quiz Success Rate"
            value={`${analytics.successRate}%`}
            note={`${analytics.correctAnswers} correct out of ${analytics.totalAnswers}`}
            icon={Target}
          />
          <StatCard
            title="Wrong Answers"
            value={analytics.wrongAnswers}
            note="Incorrect answers recorded"
            icon={XCircle}
          />
          <StatCard
            title="Course Completion"
            value={`${analytics.completionRate}%`}
            note={`${analytics.completedCourses} completed records`}
            icon={Trophy}
          />
          <StatCard
            title="Total Learners"
            value={users.length}
            note="Registered users"
            icon={Users}
          />
        </div>

        <Card
          title="Course Performance"
          subtitle="Success and completion rate by course"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[13px] text-gray-400 border-b border-[#F0EAF7]">
                  <th className="py-3 font-medium">Course</th>
                  <th className="py-3 font-medium">Quiz Answers</th>
                  <th className="py-3 font-medium">Success Rate</th>
                  <th className="py-3 font-medium">Started</th>
                  <th className="py-3 font-medium">Completed</th>
                  <th className="py-3 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.courseRows.map((course) => (
                  <tr key={course.id} className="border-b border-[#F5F0FA]">
                    <td className="py-4 text-[14px] font-semibold text-gray-900">
                      {course.title}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">{course.attempts}</td>
                    <td className="py-4 text-[14px] text-gray-500">{course.successRate}%</td>
                    <td className="py-4 text-[14px] text-gray-500">{course.started}</td>
                    <td className="py-4 text-[14px] text-gray-500">{course.completed}</td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="User Learning Progress"
          subtitle="Quiz and course progress per learner"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[13px] text-gray-400 border-b border-[#F0EAF7]">
                  <th className="py-3 font-medium">User</th>
                  <th className="py-3 font-medium">Email</th>
                  <th className="py-3 font-medium">Quiz Answers</th>
                  <th className="py-3 font-medium">Correct</th>
                  <th className="py-3 font-medium">Avg Score</th>
                  <th className="py-3 font-medium">Completed Courses</th>
                </tr>
              </thead>
              <tbody>
                {analytics.userRows.map((user) => (
                  <tr key={user.id} className="border-b border-[#F5F0FA]">
                    <td className="py-4 text-[14px] font-semibold text-gray-900">
                      {user.name}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">{user.email}</td>
                    <td className="py-4 text-[14px] text-gray-500">{user.attempts}</td>
                    <td className="py-4 text-[14px] text-gray-500">{user.correct}</td>
                    <td className="py-4 text-[14px] text-gray-500">{user.avgScore}%</td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.completedCourses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}