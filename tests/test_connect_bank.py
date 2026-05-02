from src.engine.connect_bank import (
    PlaidInstitutionRegistrationRequired,
    find_registration_required_error_,
    format_registration_required_guidance_,
)


def test_find_registration_required_error_from_link_events():
    state = {
        'errors': [{
            'institution': 'U.S. Bank',
            'error_code': 'INSTITUTION_REGISTRATION_REQUIRED',
            'error_message': 'not yet registered',
            'link_session_id': 'session_123',
        }],
        'exit': {},
    }

    result = find_registration_required_error_(state)

    assert result['institution'] == 'U.S. Bank'
    assert result['link_session_id'] == 'session_123'


def test_registration_required_guidance_is_specific():
    message = format_registration_required_guidance_(
        PlaidInstitutionRegistrationRequired(
            institution='U.S. Bank',
            message='not yet registered',
            link_session_id='session_123',
        )
    )

    assert 'U.S. Bank' in message
    assert 'not yet registered' in message
    assert 'https://dashboard.plaid.com/activity/status/oauth-institutions' in message
    assert '.env was not changed' in message
