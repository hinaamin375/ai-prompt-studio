from __future__ import annotations

from sqlalchemy.orm import Session

from app.domain.regression_comparison import (
    RegressionComparator,
    RegressionComparison,
    regression_comparator,
)
from app.mappers.regression_comparison_mapper import (
    RegressionComparisonMapper,
    regression_comparison_mapper,
)
from app.services.prompt_test_suite_run_service import (
    PromptTestSuiteRunService,
    prompt_test_suite_run_service,
)


class RegressionComparisonService:
    def __init__(
        self,
        *,
        suite_run_service: (
            PromptTestSuiteRunService | None
        ) = None,
        mapper: (
            RegressionComparisonMapper | None
        ) = None,
        comparator: (
            RegressionComparator | None
        ) = None,
    ) -> None:
        self._suite_run_service = (
            suite_run_service
            or prompt_test_suite_run_service
        )

        self._mapper = (
            mapper
            or regression_comparison_mapper
        )

        self._comparator = (
            comparator
            or regression_comparator
        )

    def compare_suite_runs(
        self,
        db: Session,
        prompt_id: int,
        before_suite_run_id: int,
        after_suite_run_id: int,
    ) -> RegressionComparison:
        before_suite = (
            self._suite_run_service
            .get_suite_run(
                db=db,
                prompt_id=prompt_id,
                suite_run_id=(
                    before_suite_run_id
                ),
            )
        )

        after_suite = (
            self._suite_run_service
            .get_suite_run(
                db=db,
                prompt_id=prompt_id,
                suite_run_id=(
                    after_suite_run_id
                ),
            )
        )

        before_snapshot = (
            self._mapper.to_suite_snapshot(
                before_suite,
            )
        )

        after_snapshot = (
            self._mapper.to_suite_snapshot(
                after_suite,
            )
        )

        return self._comparator.compare(
            before_snapshot,
            after_snapshot,
        )


regression_comparison_service = (
    RegressionComparisonService()
)