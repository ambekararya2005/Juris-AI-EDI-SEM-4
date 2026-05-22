"""initial_schema

Revision ID: 4601d59a433e
Revises: 
Create Date: 2026-05-22 12:29:17.737995

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4601d59a433e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check and create custom Enum types if they don't exist
    conn = op.get_bind()
    
    res_doc = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'documenttype'")).fetchone()
    if not res_doc:
        op.execute("CREATE TYPE documenttype AS ENUM ('VAKALATNAMA', 'PETITION', 'AFFIDAVIT', 'BAIL_APPLICATION', 'ANTICIPATORY_BAIL', 'BUSINESS_AGREEMENT', 'RENTAL_AGREEMENT', 'LEGAL_NOTICE', 'CONSUMER_COMPLAINT', 'RTI_APPLICATION', 'UPLOADED')")
        
    res_role = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'userrole'")).fetchone()
    if not res_role:
        op.execute("CREATE TYPE userrole AS ENUM ('CLIENT', 'LAWYER', 'ADMIN')")

    # 1. Create case_law table
    op.create_table('case_law',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('case_name', sa.String(), nullable=False),
    sa.Column('citation', sa.String(), nullable=False),
    sa.Column('court', sa.String(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('legal_domain', sa.String(), nullable=False),
    sa.Column('bench_type', sa.String(), nullable=True),
    sa.Column('outcome', sa.String(), nullable=True),
    sa.Column('ipc_sections', sa.String(), nullable=True),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('full_text', sa.Text(), nullable=True),
    sa.Column('source_url', sa.String(), nullable=True),
    sa.Column('faiss_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('citation')
    )

    # 2. Create users table
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('role', postgresql.ENUM(name='userrole', create_type=False), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('is_verified', sa.Boolean(), nullable=True),
    sa.Column('bar_council_number', sa.String(), nullable=True),
    sa.Column('enrollment_year', sa.String(), nullable=True),
    sa.Column('aadhaar_last4', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 3. Add new columns to documents (all nullable=True to prevent crashes on existing data)
    op.add_column('documents', sa.Column('doc_type', postgresql.ENUM(name='documenttype', create_type=False), nullable=True))
    op.add_column('documents', sa.Column('owner_id', sa.UUID(), nullable=True))
    op.add_column('documents', sa.Column('case_number', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('questionnaire_data', sa.JSON(), nullable=True))
    op.add_column('documents', sa.Column('storage_path', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('risk_score', sa.Integer(), nullable=True))
    op.add_column('documents', sa.Column('risk_report', sa.JSON(), nullable=True))
    op.add_column('documents', sa.Column('summary', sa.JSON(), nullable=True))

    # 4. Add new columns to saved_cases
    op.add_column('saved_cases', sa.Column('case_id', sa.UUID(), nullable=True))
    op.add_column('saved_cases', sa.Column('matter_label', sa.String(), nullable=True))


def downgrade() -> None:
    # Drop columns from saved_cases
    op.drop_column('saved_cases', 'matter_label')
    op.drop_column('saved_cases', 'case_id')

    # Drop columns from documents
    op.drop_column('documents', 'summary')
    op.drop_column('documents', 'risk_report')
    op.drop_column('documents', 'risk_score')
    op.drop_column('documents', 'storage_path')
    op.drop_column('documents', 'questionnaire_data')
    op.drop_column('documents', 'case_number')
    op.drop_column('documents', 'owner_id')
    op.drop_column('documents', 'doc_type')

    # Drop users and case_law tables
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_table('case_law')
    # ### end Alembic commands ###
