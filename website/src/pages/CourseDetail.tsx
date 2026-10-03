import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteFrame from '@/components/SiteFrame';
import { loadCourses } from '@/lib/local-content';

// Legacy /course/:id route — redirect to the matching static HTML in /courses/.
const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const courses = await loadCourses();
      const match = courses.find(c => c.id === id);
      if (match?.page) {
        window.location.replace(match.page);
      } else {
        navigate('/#courses', { replace: true });
      }
    })();
  }, [id, navigate]);

  return (
    <SiteFrame mainClassName="pt-24">
      <div className="container mx-auto max-w-3xl section-padding text-center text-muted-foreground">
        Redirecting to course page…
      </div>
    </SiteFrame>
  );
};

export default CourseDetail;
