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
import { collection, collectionGroup, onSnapshot } from "firebase/firestore";
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
      {subtitle && (
        <p className="text-[14px] text-gray-400 mt-1 mb-6">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

export default function LearningAnalytics() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizSummaries, setQuizSummaries] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubQuizAttempts = onSnapshot(
      collectionGroup(db, "quizAttempts"),
      (snapshot) => {
        setQuizAttempts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            userId: doc.ref.parent.parent?.id,
            ...doc.data(),
          }))
        );
      }
    );

    const unsubQuizSummaries = onSnapshot(
      collectionGroup(db, "quizSummaries"),
      (snapshot) => {
        setQuizSummaries(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            userId: doc.ref.parent.parent?.id,
            ...doc.data(),
          }))
        );
      }
    );

    return () => {
      unsubUsers();
      unsubCourses();
      unsubQuizAttempts();
      unsubQuizSummaries();
    };
  }, []);

  const analytics = useMemo(() => {
    const totalQuizzes = quizSummaries.length;

    const totalCorrect = quizSummaries.reduce(
      (sum, quiz) => sum + (quiz.correctAnswers || 0),
      0
    );

    const totalWrong = quizSummaries.reduce(
      (sum, quiz) => sum + (quiz.wrongAnswers || 0),
      0
    );

    const averageScore =
      totalQuizzes === 0
        ? 0
        : Math.round(
            quizSummaries.reduce(
              (sum, quiz) => sum + (quiz.scorePercentage || 0),
              0
            ) / totalQuizzes
          );

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
      const summaries = quizSummaries.filter((q) => q.courseId === course.id);

      const avgScore =
        summaries.length === 0
          ? 0
          : Math.round(
              summaries.reduce(
                (sum, quiz) => sum + (quiz.scorePercentage || 0),
                0
              ) / summaries.length
            );

      const correct = summaries.reduce(
        (sum, quiz) => sum + (quiz.correctAnswers || 0),
        0
      );

      const wrong = summaries.reduce(
        (sum, quiz) => sum + (quiz.wrongAnswers || 0),
        0
      );

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
        quizzesCompleted: summaries.length,
        avgScore,
        correct,
        wrong,
        started: courseStarted,
        completed: courseCompleted,
        completionRate: courseCompletion,
      };
    });

    const userRows = users.map((user) => {
      const summaries = quizSummaries.filter((q) => q.userId === user.id);

      const avgScore =
        summaries.length === 0
          ? 0
          : Math.round(
              summaries.reduce(
                (sum, quiz) => sum + (quiz.scorePercentage || 0),
                0
              ) / summaries.length
            );

      const correct = summaries.reduce(
        (sum, quiz) => sum + (quiz.correctAnswers || 0),
        0
      );

      const wrong = summaries.reduce(
        (sum, quiz) => sum + (quiz.wrongAnswers || 0),
        0
      );

      const progress = user.courseProgress || {};
      const completed = Object.values(progress).filter(
        (p) => p.completed === true
      ).length;

      return {
        id: user.id,
        name: user.name || user.displayName || "Unnamed User",
        email: user.email || "No email",
        quizzesCompleted: summaries.length,
        correct,
        wrong,
        avgScore,
        completedCourses: completed,
      };
    });

    const weakAreaMap = {};

quizAttempts.forEach((attempt) => {
  if (attempt.isCorrect === false) {
    const key = attempt.questionId || attempt.questionText;

    if (!weakAreaMap[key]) {
      const course = courses.find((c) => c.id === attempt.courseId);

      weakAreaMap[key] = {
        id: key,
        questionText: attempt.questionText || "Question text unavailable",
        courseTitle: course?.title || course?.courseTitle || "Unknown Course",
        lessonTitle: attempt.lessonTitle || "Unknown Lesson",
        wrongCount: 0,
      };
    }

    weakAreaMap[key].wrongCount++;
  }
});

const weakAreas = Object.values(weakAreaMap)
  .sort((a, b) => b.wrongCount - a.wrongCount)
  .slice(0, 5);

    return {
      totalQuizzes,
      totalCorrect,
      totalWrong,
      averageScore,
      completedCourses,
      completionRate,
      courseRows,
      userRows,
      quizAttempts,
      weakAreas,
    };
  }, [users, courses, quizSummaries, quizAttempts]);

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8">
      <div className="space-y-7">
        <div>
          <h1 className="text-[38px] font-semibold text-gray-950 tracking-tight">
            Learning Analytics
          </h1>
          <p className="text-[15px] text-gray-400 mt-2">
            Detailed view of completed quizzes, course completion, and learner
            progress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Average Quiz Score"
            value={`${analytics.averageScore}%`}
            note={`${analytics.totalQuizzes} completed quizzes`}
            icon={Target}
          />
          <StatCard
            title="Wrong Answers"
            value={analytics.totalWrong}
            note="Incorrect answers from completed quizzes"
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
  title="Weak Areas"
  subtitle="Questions learners answered incorrectly most often"
>
  {analytics.weakAreas.length === 0 ? (
    <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] p-5">
      <p className="text-[14px] text-gray-500">
        No weak areas detected yet. Once learners answer questions incorrectly,
        they will appear here.
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {analytics.weakAreas.map((item, index) => (
        <div
          key={item.id}
          className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-8 w-8 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-[13px] font-bold">
                {index + 1}
              </span>
              <p className="text-[13px] text-gray-400">
                {item.courseTitle} • {item.lessonTitle}
              </p>
            </div>

            <p className="text-[15px] font-semibold text-gray-900 leading-relaxed">
              {item.questionText}
            </p>
          </div>

          <div className="rounded-full bg-red-50 text-red-600 px-4 py-2 text-[13px] font-semibold w-fit">
            {item.wrongCount} wrong
          </div>
        </div>
      ))}
    </div>
  )}
</Card>

        <Card
          title="Course Performance"
          subtitle="Average quiz scores and completion rate by course"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[13px] text-gray-400 border-b border-[#F0EAF7]">
                  <th className="py-3 font-medium">Course</th>
                  <th className="py-3 font-medium">Quizzes Completed</th>
                  <th className="py-3 font-medium">Avg Score</th>
                  <th className="py-3 font-medium">Correct</th>
                  <th className="py-3 font-medium">Wrong</th>
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
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.quizzesCompleted}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.avgScore}%
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.correct}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.wrong}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.started}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {course.completed}
                    </td>
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
          subtitle="Completed quiz summaries and course progress per learner"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[13px] text-gray-400 border-b border-[#F0EAF7]">
                  <th className="py-3 font-medium">User</th>
                  <th className="py-3 font-medium">Email</th>
                  <th className="py-3 font-medium">Quizzes Completed</th>
                  <th className="py-3 font-medium">Correct</th>
                  <th className="py-3 font-medium">Wrong</th>
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
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.email}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.quizzesCompleted}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.correct}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.wrong}
                    </td>
                    <td className="py-4 text-[14px] text-gray-500">
                      {user.avgScore}%
                    </td>
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